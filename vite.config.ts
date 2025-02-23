import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			src: path.resolve(__dirname, "./src"),
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
