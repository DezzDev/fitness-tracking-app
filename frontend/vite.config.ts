import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
	plugins: [ react(), tailwindcss() ],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return
					if (
						id.includes("@tanstack/react-query") ||
						id.includes("axios") ||
						id.includes("zustand")
					) return "vendor-data"
					if (
						id.includes("react-hook-form") ||
						id.includes("@hookform/resolvers") ||
						id.includes("zod")
					) return "vendor-forms"
					if (
						id.includes("date-fns") ||
						id.includes("react-day-picker")
					) return "vendor-dates"
					if (
						id.includes("@radix-ui") ||
						id.includes("cmdk") ||
						id.includes("sonner") ||
						id.includes("lucide-react")
					) return "vendor-ui"
					if (
						id.includes("react") ||
						id.includes("react-dom") ||
						id.includes("scheduler")
					) return "vendor-react"

					return "vendor-misc"
				},
			},
		},
	},
})
