// src/components/layouts/RootLayout.tsx

import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { useEffect, useRef } from "react"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"

const HYDRATE_THROTTLE_MS = 60_000;

export default function RootLayout() {
	const loadUser = useAuthStore((state) => state.loadUser);
	const hydrateUserFromServer = useAuthStore((state) => state.hydrateUserFromServer);
	const syncUserFromStorage = useAuthStore((state) => state.syncUserFromStorage);
	const initializeTheme = useThemeStore((state) => state.initializeTheme);

	const lastHydrateRef = useRef(0);

	const handleHydrate = () => {
		const now = Date.now();
		if (now - lastHydrateRef.current < HYDRATE_THROTTLE_MS) return;
		lastHydrateRef.current = now;
		hydrateUserFromServer();
	};

	useEffect(() => {
		loadUser();
		initializeTheme();
		handleHydrate();
	}, [loadUser, initializeTheme]);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				handleHydrate();
			}
		};

		const handleFocus = () => {
			handleHydrate();
		};

		const handleStorage = (event: StorageEvent) => {
			if (event.key === 'user' || event.key === 'accessToken') {
				syncUserFromStorage();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', handleFocus);
		window.addEventListener('storage', handleStorage);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('focus', handleFocus);
			window.removeEventListener('storage', handleStorage);
		};
	}, [syncUserFromStorage]);

	return (
		<>
			<Outlet />
			<Toaster />
		</>
	)
}
