from enum import Enum
from typing import Any, List, Optional

from pydantic import BaseModel


class AiMealExtractRequest(BaseModel):
    images: List[str]
    textualData: str  # Optional, can be used for additional context


class BarcodeMealItemExtractRequest(BaseModel):
    image_base64: str


class ResponseModel(BaseModel):
    success: bool
    message: str
    data: Optional[Any]


class Unit(str, Enum):
    Grams = "g"
    Milliliters = "ml"
    Pieces = "pcs"
    Slices = "slice"
    Cups = "cup"
    Tablespoons = "tbsp"
    Servings = "serving"


class MealItem(BaseModel):
    id: str
    name: str
    image: Optional[str]

    servingSize: float
    servingUnit: Unit
    amount: float
    kcalPerServing: float
    carbPerServing_g: float
    satFatPerServing_g: float
    source: Optional[str]

    fii: float
    gi: float


class Meal(BaseModel):
    id: str  # Same — you can generate in backend
    name: str
    timestamp: int  # You can inject time after parsing
    items: List[MealItem]


class MealIndexes(BaseModel):
    fii: float
    gi: float
