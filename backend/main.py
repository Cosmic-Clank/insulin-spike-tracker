from services import ai_meal_extract_gpt
from models import AiMealExtractRequest,  BarcodeMealItemExtractRequest, Meal, ResponseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
import uuid
import time

from utils import build_meal_item_from_product, decode_barcode_from_base64, fetch_off_product, save_base64_images


# Load environment variables from .env file

app = FastAPI()

# Allow all domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


@app.post("/ai-meal-extract", response_model=ResponseModel)
async def extract_meal(data: AiMealExtractRequest):
    try:
        meal = ai_meal_extract_gpt(data.images, data.textualData)
        meal_id = str(uuid.uuid4())

        for item in meal.items:
            item.image = data.images[0] if data.images else None

        # save_base64_images(data.images, folder="images")

        return ResponseModel(
            success=True,
            message="Meal extracted successfully",
            data={
                "meal": {
                    "id": meal_id,
                    "name": meal.name,
                    "timestamp": int(time.time() * 1000),
                    "items": [item.model_dump() for item in meal.items],
                }
            }
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/barcode-meal-item-extract", response_model=ResponseModel)
async def barcode_meal_item_extract(req: BarcodeMealItemExtractRequest):
    try:
        code = decode_barcode_from_base64(req.image_base64)
        if not code:
            return ResponseModel(
                success=False,
                message="Barcode not found",
                data={},
            )

        product = await fetch_off_product(code)
        if not product:
            return ResponseModel(
                success=False,
                message="Barcode decoded but product not found",
                data={"barcode": code},
            )
        mealItem = build_meal_item_from_product(product, code)
        return ResponseModel(
            success=True,
            message="Meal extracted from barcode",
            data={"mealItem": mealItem, "barcode": code},
        )
    except Exception as e:
        print(f"[barcode-meal-extract] Error: {e}")
        raise HTTPException(
            status_code=500, detail="Internal error decoding barcode")
