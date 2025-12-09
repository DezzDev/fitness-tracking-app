// src/components/layouts/RootLayout.tsx

import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

export default function RootLayout() {
	const loadUser = useAuthStore((state) => state.loadUser);

	// Cargar usuario al montar la app
	useEffect(() => {
		loadUser();
	}, [ loadUser ])

	return (
		<>
			<Outlet />
			<Toaster />
		</>
	)
}
