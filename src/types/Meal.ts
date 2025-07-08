import { MealItem } from "./MealItem";

export type Meal = {
	id: string;
	image: string | null;
	name: string;
	timestamp: number;
	items: MealItem[];
};
