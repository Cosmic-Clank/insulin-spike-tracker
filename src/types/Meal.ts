import { MealItem } from "./MealItem";

export type Meal = {
	id: string;
	name: string;
	timestamp: number;
	items: MealItem[];
	aiComment: string;
};
