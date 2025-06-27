// src/stores/settingsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
	darkMode: boolean;
	toggleDarkMode: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			darkMode: true,
			toggleDarkMode: (value) => {
				set({ darkMode: value });

				// Ionic-style class application
				document.documentElement.classList.toggle("ion-palette-dark", value);
			},
		}),
		{
			name: "app-settings",
		}
	)
);
