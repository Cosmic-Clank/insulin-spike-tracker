import config from "../../config.json"; // adjust path as needed
import { Meal } from "../types/Meal";

export const fetchMealFromAPI = async (base64Images: string[], textualData: string): Promise<Meal> => {
	const res = await fetch(`${config.backend_api_url}/ai-meal-extract`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ images: base64Images, textualData }),
	});
	if (!res.ok) throw new Error("Failed to extract meal.");
	const response = await res.json();
	return response.data.meal;
};
