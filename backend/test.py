import base64
import io
from typing import Optional
from PIL import Image
import numpy as np
from pyzbar.pyzbar import decode, ZBarSymbol
import cv2


def preprocess(img: np.ndarray) -> np.ndarray:
    """Preprocess to make barcodes more readable."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    den = cv2.fastNlMeansDenoising(gray, h=7)
    # bump contrast
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    cla = clahe.apply(den)
    # adaptive threshold
    th = cv2.adaptiveThreshold(
        cla, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 41, 10
    )
    return th


def decode_barcode_from_base64(b64_string: str) -> str | None:
    """Return decoded barcode text or None."""
    # decode base64 -> image
    if b64_string.startswith("data:image"):
        b64_string = b64_string.split(",", 1)[-1]
    img_data = base64.b64decode(b64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    def try_decode(image: np.ndarray):
        codes = decode(image, [
            ZBarSymbol.EAN13,
            ZBarSymbol.EAN8,
            ZBarSymbol.UPCA,
            ZBarSymbol.UPCE,
            ZBarSymbol.CODE128,
            ZBarSymbol.CODE39,
            ZBarSymbol.CODABAR,
            ZBarSymbol.QRCODE,
        ])
        if codes:
            return codes[0].data.decode("utf-8", errors="ignore")
        return None

    # Try raw image and preprocessed image at different rotations
    for angle in [0, 90, 180, 270]:
        if angle != 0:
            # Rotate image
            rot_img = cv2.rotate(img, {
                90: cv2.ROTATE_90_CLOCKWISE,
                180: cv2.ROTATE_180,
                270: cv2.ROTATE_90_COUNTERCLOCKWISE
            }[angle])
        else:
            rot_img = img

        result = try_decode(rot_img)
        if result:
            return result

        # Try preprocessed
        proc = preprocess(rot_img)
        proc_bgr = cv2.cvtColor(proc, cv2.COLOR_GRAY2BGR)
        result = try_decode(proc_bgr)
        if result:
            return result

    return None


def capture_barcode_image():
    cap = cv2.VideoCapture(1)
    print("Press SPACE to capture barcode, ESC to exit.")
    img = None
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow("Barcode Capture", frame)
        key = cv2.waitKey(1)
        if key == 27:  # ESC
            break
        elif key == 32:  # SPACE
            img = frame
            break
    cap.release()
    cv2.destroyAllWindows()
    if img is not None:
        # Save to file for testing
        cv2.imwrite("test_image.png", img)
        # Convert to base64
        _, buf = cv2.imencode('.png', img)
        b64image = base64.b64encode(buf.tobytes()).decode("utf-8")
        return b64image
    return None


b64image = base64.b64encode(open("decoded_image.png", "rb").read()).decode(
    "utf-8") if "decoded_image.png" else None
if b64image:
    print(decode_barcode_from_base64(b64image))
else:
    print("No image captured.")
