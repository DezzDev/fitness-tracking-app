// src/components/layouts/RootLayout.tsx

import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"

export default function RootLayout() {
	const loadUser = useAuthStore((state) => state.loadUser);
	const initializeTheme = useThemeStore((state) => state.initializeTheme);

	// Cargar usuario al montar la app
	useEffect(() => {
		loadUser();
		initializeTheme();
	}, [ loadUser, initializeTheme ])

	return (
		<>
			<Outlet />
			<Toaster />
		</>
	)
}
