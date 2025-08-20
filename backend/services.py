from typing import List

from fastapi import HTTPException
from dotenv import load_dotenv

from models import Meal, MealIndexes
from openai import OpenAI
load_dotenv()

client = OpenAI()


def ai_meal_extract_gpt(images: List[str], textual_data: str = "") -> Meal:
    try:
        prompt = """
        You are a nutritionist assistant. Analyze the image of the food and extract the overall meal name and a list of food ingredients that appear in the entire meal.

        For each food ingredient, return the following information as a structured JSON object:

        - **name**: the name of the ingredient;
        - **servingSize**: the size of a single serving;
        - **servingUnit**: the unit of measurement for the serving size;
        - **amount**: the amount of servings the user consumed. Default to 1 unless the user specifies otherwise;
        - **kcalPerServing**: the amount of calories in kcal for one serving of the food;
        - **carbPerServing_g**: the grams of carbohydrates in one serving of the food;
        - **satFatPerServing_g**: the grams of saturated fat in one serving of the food;
        - **source**: just give this field as "ai";

        - **fii**: your best estimation of the Food Insulin Index (FII) of the item.
        - **gi**: your best estimation of the Glycemic Index (GI) of the item.

        The Serving size can be just "1", and the serving unit can be just "serving" if the food is a single piece or portion.
        
        ⚠️ Important:
        - If images of a nutritional label are provided, use that information as a single item instead of creating multiple items for each ingredient.
        - Make sure to understand the nutitional label correctly. Note the serving size mentioned on the label, note the percentage of the nutional value, and calculate the values accordingly based on how much of the food was consumed.

        Return only the meal name and the array of items in valid JSON format, no text explanation.

        """

        content = [{"type": "input_text", "text": prompt}]

        content += [{"type": "input_image", "image_url": image}
                    for image in images]

        if textual_data:
            content.append({"type": "input_text", "text": textual_data})

        response = client.responses.parse(
            model="gpt-4.1",
            input=[{
                "role": "user",
                "content": content,
            }],  # type: ignore
            text_format=Meal
        )

        parsed_meal = response.output_parsed

        if not parsed_meal:
            raise HTTPException(
                status_code=400, detail="Invalid meal data received")

        return parsed_meal

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


def get_ai_fii_gi(mealInfo: dict):
    response = client.responses.parse(
        model="gpt-4.1",
        input=[{
            "role": "user",
            "content": [{"type": "input_text", "text": "I need you to extract to your best estimation the FII and GI values from the following meal information: " + str(mealInfo)}],
        }],  # type: ignore
        text_format=MealIndexes
    )

    if not response.output_parsed:
        raise HTTPException(
            status_code=400, detail="Invalid FII/GI data received")

    return (response.output_parsed.fii, response.output_parsed.gi)
