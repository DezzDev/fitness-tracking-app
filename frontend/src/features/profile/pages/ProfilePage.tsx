// src/features/profile/pages/ProfilePage.tsx
import { useAuthStore } from "@/store/authStore";

function ProfilePage() {
	const user = useAuthStore((state) => state.user);

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
			<div className="bg-white p-6 rounded-lg shadow-sm">
				<dl className="space-y-4">
					<div>
						<dt className="text-sm font-medium text-gray-500">Nombre</dt>
						<dd className="mt-1 text-lg text-gray-900">{user?.name}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500">Email</dt>
						<dd className="mt-1 text-lg text-gray-900">{user?.email}</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500">Edad</dt>
						<dd className="mt-1 text-lg text-gray-900">{user?.age} años</dd>
					</div>
					<div>
						<dt className="text-sm font-medium text-gray-500">Rol</dt>
						<dd className="mt-1 text-lg text-gray-900">{user?.role}</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}

export default ProfilePage