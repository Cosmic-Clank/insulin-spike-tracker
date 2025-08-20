import config from "../../config.json"; // adjust path as needed
import { Meal } from "../types/Meal";
import { MealItem } from "../types/MealItem";

export const fetchAiMealFromAPI = async (base64Images: string[], textualData: string): Promise<Meal> => {
	const res = await fetch(`${config.backend_api_url}/ai-meal-extract`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ images: base64Images, textualData }),
	});
	if (!res.ok) throw new Error("Failed to extract meal.");
	const response = await res.json();
	return response.data.meal;
};

export const fetchBarcodeMealItemFromAPI = async (base64Image: string): Promise<MealItem> => {
	const res = await fetch(`${config.backend_api_url}/barcode-meal-item-extract`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ image_base64: base64Image }),
	});
	if (!res.ok) throw new Error("Failed to scan barcode.");

	const response = await res.json();
	if (response.success) {
		return response.data.mealItem;
	} else {
		throw new Error(response.message || "Failed to scan barcode.");
	}
};
