// src/features/profile/components/EditProfileForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateProfile } from "@/features/profile/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";

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
	const { mutate: updateProfile, isPending } = useUpdateProfile()

	const {
		register,
		handleSubmit,
		formState: { errors, isDirty }
	} = useForm<UpdateProfileFormData>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			name: user?.name || '',
			age: user?.age || 18,
		}
	});

	const onSubmit = (data: UpdateProfileFormData) => {
		updateProfile(data)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Editar perfil</CardTitle>
				<CardDescription>
					Actualiza tu información de perfil
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

					{/* Email (solo lectura) */}
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={user?.email || ''}
							disabled
							className="bg-[var(--surface-elevated)]"
						/>
						<p className="text-xs text-muted-foreground">
							El email no se puede modificar
						</p>
					</div>

					{/* Nombre */}
					<div className="space-y-2">
						<Label htmlFor="name">Nombre</Label>
						<Input
							id="name"
							type="text"
							placeholder="Tu nombre"
							disabled={isPending}
							{...register('name')}
						/>
						{errors.name && (
							<p className="text-sm text-destructive">{errors.name.message}</p>
						)}
					</div>

					{/* Edad */}
					<div className="space-y-2">
						<Label htmlFor="age">Edad</Label>
						<Input
							id="age"
							type="number"
							min={15}
							max={120}
							disabled={isPending}
							{...register('age', { valueAsNumber: true })}
						/>
						{errors.age && (
							<p className="text-sm text-destructive">{errors.age.message}</p>
						)}
					</div>

					{/* Botones */}
					<div className="flex gap-3 pt-4">
						<Button
							type="submit"
							disabled={!isDirty || isPending}
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Guardando...
								</>
							):(
								'Guardar cambios'
							)}
						</Button>

						<Button
							type="button"
							variant={"outline"}
							disabled={isPending}
							onClick={()=> window.location.reload()}
						>
							Cancelar
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

export default EditProfileForm