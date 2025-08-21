import base64
import os
import time
import uuid
from typing import Optional

import cv2
import httpx
import numpy as np
from pyzbar.pyzbar import decode, ZBarSymbol
from services import get_ai_fii_gi


def save_base64_images(images: list[str], folder: str = "images") -> None:
    os.makedirs(folder, exist_ok=True)
    for idx, image in enumerate(images, start=1):
        image_data = base64.b64decode(image.split(",")[-1])
        with open(f"{folder}/{idx}.jpg", "wb") as f:
            f.write(image_data)


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
    if b64_string.startswith("data:image"):
        b64_string = b64_string.split(",", 1)[-1]
    # decode base64 -> image
    img_data = base64.b64decode(b64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    cv2.imwrite("decoded_image.png", img)

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


async def fetch_off_product(barcode: str) -> Optional[dict]:
    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url)
        if r.status_code == 404:
            return None
        r.raise_for_status()
        data = r.json()
        if data.get("status") == 1 and data.get("product"):
            return data["product"]
    return None


def build_meal_item_from_product(product: dict, barcode: str) -> dict:
    n = product.get("nutriments", {}) or {}
    servingSize = product.get("serving_quantity", 100)
    servingUnit = product.get("serving_quantity_unit", "g")

    # kcals
    kcal_serv = n.get("energy-kcal")
    if kcal_serv is None:
        kcal_serv = 0.0

    carbs_serv = n.get("carbohydrates")
    if carbs_serv is None:
        carbs_serv = 0.0

    satfat_serv = n.get("saturated-fat")
    if satfat_serv is None:
        satfat_serv = 0.0

    # Assemble a single item for your meal structure
    fii, gi = get_ai_fii_gi(product)
    item = {
        "id": str(uuid.uuid4()),
        "name": product.get("product_name") or product.get("brands") or "Scanned item",
        "image": product.get("image_url") or "",
        "timestamp": int(time.time() * 1000),
        "servingSize": servingSize,
        "servingUnit": servingUnit,
        "amount": 1,
        "kcalPerServing": round(float(kcal_serv)),
        "carbPerServing_g": round(float(carbs_serv)),
        "satFatPerServing_g": round(float(satfat_serv), 1),
        "gi": gi,       # you’ll estimate or let user edit
        "fii": fii,      # you’ll estimate or let user edit
        "barcode": barcode,
        "source": "openfoodfacts",

    }

    return item
