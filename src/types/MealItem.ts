export enum Unit {
	Grams = "g",
	Milliliters = "ml",
	Pieces = "pcs",
	Slices = "slice",
	Cups = "cup",
	Tablespoons = "tbsp",
	Servings = "serving",
}

export type MealItem = {
	id: string;
	name: string;
	fii: number;

	quantity: number;
	unit: Unit;
	kcalPerUnit: number;

	carb_g: number;
	gi: number;
	satFat_g: number;
};
