import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import { StatusBar } from "@capacitor/status-bar";

const container = document.getElementById("root");
const root = createRoot(container!);

// Call the element loader before the render call
defineCustomElements(window);

(async () => {
	// Option 1: make the webview stop under the status bar (no overlap)
	await StatusBar.setOverlaysWebView({ overlay: false });

	// Optional: set a background color for Android status bar
	// await StatusBar.setBackgroundColor({ color: "#3880ff" });
})();

root.render(
	// <React.StrictMode>
	<App />
	// </React.StrictMode>
);
