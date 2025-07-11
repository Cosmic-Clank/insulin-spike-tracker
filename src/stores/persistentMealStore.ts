import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Meal } from "../types/Meal";
import { MealItem } from "../types/MealItem";

type MealState = {
	meals: Meal[];
	addMeal: (meal: Meal) => void;
	deleteMeal: (id: string) => void;
	clearMeals: () => void;
	getMealById: (id: string) => Meal | null;
};

// --------- Acute Score Helper ---------

export const calculateAcuteScore = (items: MealItem[]): number => {
	const totalKcal = items.reduce((sum, item) => sum + item.quantity * item.kcalPerUnit, 0);
	if (totalKcal === 0) return 0;
	const weighted = items.reduce((sum, item) => sum + item.fii * (item.quantity * item.kcalPerUnit), 0);
	return Math.round(weighted / totalKcal);
};

// --------- Chronic Score Helper ---------

// --------- Zustand Store ---------

export const usePersistentMealStore = create<MealState>()(
	persist(
		(set, get) => ({
			meals: [],
			addMeal: (meal: Meal) => {
				set({ meals: [meal, ...get().meals] });
			},
			deleteMeal: (id: string) => set({ meals: get().meals.filter((m) => m.id !== id) }),
			clearMeals: () => set({ meals: [] }),
			getMealById: (id: string) => get().meals.find((meal) => meal.id === id) || null,
		}),
		{
			name: "insight-meals", // localStorage key
		}
	)
);
