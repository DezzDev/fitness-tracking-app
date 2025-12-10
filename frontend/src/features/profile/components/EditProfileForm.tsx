// src/features/profile/components/EditProfileForm.tsx
import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {z} from "zod";
import {Loader2} from "lucide-react";

import {Button} from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useUpdateProfile} from "@/features/profile/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";
import { use } from "react";

const updateProfileSchema = z.object({
	name: z
		.string()
		.min(2, 'El nombre debe tener al menos 2 caracteres')
		.max(50, 'El nombre no puede tener más de 50 caracteres')
		.trim(),
	age: z
		.number('La edad debe de ser un número')
		.int('La edad debe de ser un número entero')
		.min(15, 'Debes tener al menos 15 años')
		.max(120, 'Edad inválida'),
})

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

function EditProfileForm() {
	const user = useAuthStore((state) => state.user);
	const {mutate: updateProfile, isPending} = useUpdateProfile()

	const {
		register,
		handleSubmit,
		formState: {errors, isDirty}		
	} = useForm<UpdateProfileFormData>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user?.name || '',
			age: user?.age || 18,
		}
	});

	const onSubmit = (data: UpdateProfileFormData)=>{
		updateProfile(data)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Editar perfil</CardTitle>
			</CardHeader>
		</Card>
	)
}

export default EditProfileForm