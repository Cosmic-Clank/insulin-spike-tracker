import { ActivityLevel, Gender } from "./stores/settingsStore";
import { Meal } from "./types/Meal";

export const calculateChronicScore = (meals: Meal[]): number => {
	const tdee = 2000; // Total Daily Energy Expenditure, can be dynamic based on user settings
	let sum = 0;
	let count = 0;
	meals.map((meal) => {
		const chronicLoad = meal.items.reduce((sum, item) => {
			const glycemicLoad = item.gi * item.carb_g * 0.01;
			const kcal = item.kcalPerUnit * item.quantity;

			return sum + (0.5 * glycemicLoad + 0.3 * item.satFat_g + 0.2 * (kcal / tdee));
		}, 0);
		sum += chronicLoad;
		count += 1;
	});
	return Math.round(sum / count);
};

export const calculateBmr = (weight: number, height: number, age: number, gender: Gender): number => {
	let bmr: number;
	if (gender === "female") {
		bmr = 10 * weight + 6.25 * height - 5 * age + 5;
	} else {
		bmr = 10 * weight + 6.25 * height - 5 * age - 161;
	}
	return bmr;
};

export const calculateTdee = (weight: number, height: number, age: number, activityLevel: ActivityLevel, gender: Gender): number => {
	const bmr = calculateBmr(weight, height, age, gender);

	switch (activityLevel) {
		case ActivityLevel.Sedentary:
			return Math.round(bmr * 1.2);
		case ActivityLevel.Light:
			return Math.round(bmr * 1.375);
		case ActivityLevel.Moderate:
			return Math.round(bmr * 1.55);
		case ActivityLevel.Active:
			return Math.round(bmr * 1.725);
		case ActivityLevel.VeryActive:
			return Math.round(bmr * 1.9);
		default:
			return Math.round(bmr * 1.2); // Default to sedentary if no activity level is set
	}
};
