// src/features/profile/pages/ProfilePage.tsx

import {User, Lock, Settings} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileImageUpload from "../components/ProfileImageUpload";
import EditProfileForm from "../components/EditProfileForm";
import ChangePasswordForm from "../components/ChangePasswordForm";
import AccountSettings from "../components/AccountSettings";

export default function ProfilePage() {


	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
				<p className="text-gray-600 mt-1">
					Administra tu información personal y configuración
				</p>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">

					<TabsTrigger value="profile" className="flex items-center gap-2">
						<User size={18}/>
						<span className="hidden sm:inline">Perfil</span>
					</TabsTrigger>

					<TabsTrigger value="security" className="flex items-center gap-2">
						<Lock size={18}/>
						<span className="hidden sm:inline">Seguridad</span>
					</TabsTrigger>
					
					<TabsTrigger value="settings" className="flex items-center gap-2">
						<Settings size={18}/>
						<span className="hidden sm:inline">Configuración</span>
					</TabsTrigger>

				</TabsList>

				{/* Tab: Perfil */}
				<TabsContent value="profile" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-3">
						<div className="md:col-span-1">
							<ProfileImageUpload />
						</div>
						<div className="md:col-span-2">
							<EditProfileForm />
						</div>
					</div>
				</TabsContent>

				{/* Tab: Seguridad */}
				<TabsContent value="security" className="space-y-6">
					<ChangePasswordForm />
				</TabsContent>

				{/* Tab: Configuración */}
				<TabsContent value="settings" className="space-y-6">
					<AccountSettings />
				</TabsContent>
			</Tabs>
		</div>
	);
}



