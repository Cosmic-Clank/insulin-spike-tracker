import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Meal } from "../types/Meal";
import { MealItem } from "../types/MealItem";

type MealState = {
	meals: Meal[];
	addMeal: (meal: Meal) => void;
	deleteMeal: (id: string) => void;
	clearMeals: () => void;
};

// --------- Acute Score Helper ---------

export const calculateAcuteScore = (items: MealItem[]): number => {
	const totalKcal = items.reduce((sum, item) => sum + item.kcal, 0);
	if (totalKcal === 0) return 0;
	const weighted = items.reduce((sum, item) => sum + item.fii * item.kcal, 0);
	return Math.round(weighted / totalKcal);
};

// --------- Zustand Store ---------

export const useMealStore = create<MealState>()(
	persist(
		(set, get) => ({
			meals: [],
			addMeal: (meal: Meal) => {
				set({ meals: [meal, ...get().meals] });
			},
			deleteMeal: (id) => set({ meals: get().meals.filter((m) => m.id !== id) }),
			clearMeals: () => set({ meals: [] }),
		}),
		{
			name: "insight-meals", // localStorage key
		}
	)
);
