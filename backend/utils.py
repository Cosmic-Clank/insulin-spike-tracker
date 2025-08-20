import base64
import io
import os
import time
import uuid
from PIL import Image
from typing import Optional

import httpx
import numpy as np
from pyzbar.pyzbar import decode as zbar_decode, ZBarSymbol
from services import get_ai_fii_gi


def save_base64_images(images: list[str], folder: str = "images") -> None:
    os.makedirs(folder, exist_ok=True)
    for idx, image in enumerate(images, start=1):
        image_data = base64.b64decode(image.split(",")[-1])
        with open(f"{folder}/{idx}.jpg", "wb") as f:
            f.write(image_data)


def _strip_base64_prefix(b64: str) -> str:
    if "," in b64 and b64.strip().lower().startswith("data:"):
        return b64.split(",", 1)[1]
    return b64


def _pil_from_base64(b64: str) -> Image.Image:
    raw = base64.b64decode(_strip_base64_prefix(b64))
    return Image.open(io.BytesIO(raw)).convert("RGB")


def _rotate(img: Image.Image, deg: int) -> Image.Image:
    return img.rotate(deg, expand=True)


def decode_barcode_from_base64(img_b64: str) -> Optional[str]:
    """
    Try multiple orientations + grayscale/contrast tweaks to read 1D barcodes.
    Returns the first decoded string (EAN/UPC/Code128/etc) or None.
    """
    img = _pil_from_base64(img_b64)

    # Try a few rotations
    rotations = [0, 90, 180, 270]
    for r in rotations:
        frame = _rotate(img, r) if r else img

        # Convert to numpy and grayscale
        arr = np.array(frame)
        gray = np.dot(arr[..., :3], [0.299, 0.587, 0.114]).astype(np.uint8)

        # Light contrast stretch
        p2, p98 = np.percentile(gray, (2, 98))
        if p98 > p2:
            gray = np.clip((gray - p2) * (255.0 / (p98 - p2)),
                           0, 255).astype(np.uint8)

        pil_gray = Image.fromarray(gray)

        # Try reading multiple symbologies
        results = zbar_decode(
            pil_gray,
            symbols=[
                ZBarSymbol.EAN13,
                ZBarSymbol.EAN8,
                ZBarSymbol.UPCA,
                ZBarSymbol.UPCE,
                ZBarSymbol.CODE128,
                ZBarSymbol.CODE39,
                ZBarSymbol.QRCODE,  # just in case
            ],
        )
        if results:
            # Pick the first result
            return results[0].data.decode("utf-8").strip()

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
