import { create } from "zustand";

type ExtractMealDataStore = {
	images: string[];
	textualData: string;
	addImage: (image: string) => void;
	removeImage: (index: number) => void;
	setTextualData: (text: string) => void;
};

export const useExtractMealDataStore = create<ExtractMealDataStore>((set) => ({
	images: [],
	addImage: (image) => set((state) => ({ images: state.images.length < 5 ? [...state.images, image] : state.images })),
	removeImage: (index) => set((state) => ({ images: state.images.filter((_, i) => i !== index) })),
	textualData: "",
	setTextualData: (text) => set({ textualData: text }),
}));
