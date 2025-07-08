import { create } from "zustand";
import { Meal } from "../types/Meal";
import { MealItem } from "../types/MealItem";
import type { Unit } from "../types/MealItem";

type CurrentMealStore = {
	meal: Meal;
	setMeal: (meal: Meal) => void;
	resetMeal: () => void;
	addMealItem: (item: MealItem) => void;
	addEmptyMealItem: () => void;
	deleteMealItem: (id: string) => void;
	setNewMealId: () => void; // Generates a new ID for the meal
	setImage: (image: string | null) => void;
	setName: (name: string) => void;
	setTimestamp: (timestamp: number) => void;
};

export const useCurrentMealStore = create<CurrentMealStore>((set, get) => ({
	meal: {
		id: crypto.randomUUID(),
		image: null,
		name: "New Meal",
		timestamp: Date.now(),
		items: [],
	},

	setMeal: (meal: Meal) => {
		set({ meal });
	},

	setNewMealId: () => {
		set((state) => ({
			meal: {
				...state.meal,
				id: crypto.randomUUID(),
			},
		}));
	},

	resetMeal: () => {
		set({
			meal: {
				id: crypto.randomUUID(),
				image: null,
				name: "New Meal",
				timestamp: Date.now(),
				items: [],
			},
		});
	},

	// ✅ Add a new item to the meal
	addMealItem: (item: MealItem) => {
		set((state) => ({
			meal: {
				...state.meal,
				items: [...state.meal.items, item],
			},
		}));
	},

	// ✅ Add an empty item to the meal
	addEmptyMealItem: () => {
		const newItem: MealItem = {
			id: crypto.randomUUID(),
			name: "New Item",
			fii: 0,
			unit: "g" as Unit,
			quantity: 0,
			kcalPerUnit: 0,
			carb_g: 0,
			gi: 0,
			satFat_g: 0,
		};

		set((state) => ({
			meal: {
				...state.meal,
				items: [...state.meal.items, newItem],
			},
		}));
	},

	// Optional: delete by ID instead of index for better reliability
	deleteMealItem: (id: string) => {
		set((state) => ({
			meal: {
				...state.meal,
				items: state.meal.items.filter((item) => item.id !== id),
			},
		}));
	},

	setImage: (image: string | null) => {
		set((state) => ({
			meal: {
				...state.meal,
				image,
			},
		}));
	},

	setName: (name: string) => {
		set((state) => ({
			meal: {
				...state.meal,
				name,
			},
		}));
	},

	setTimestamp: (timestamp: number) => {
		set((state) => ({
			meal: {
				...state.meal,
				timestamp,
			},
		}));
	},
}));
