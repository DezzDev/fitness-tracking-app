import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UpdateUserData, type ChangePasswordData } from '@/api/endpoints/users';
import { authApi } from '@/api/endpoints/auth';
import { queryKeys } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { handleApiError } from '@/api/client';

/**
 * Hook para obtener el perfil del usuario
 */
export function useProfile() {
	const user = useAuthStore((state) => state.user);

	return useQuery({
		queryKey: queryKeys.profile,
		queryFn: usersApi.getProfile,
		enabled: !!user, // Solo ejecuta si hay usuario
		staleTime: 5 * 60 * 1000, // 5 minutos
	});
}

/**
 * Hook para actualizar el perfil
 */
export function useUpdateProfile() {
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);

	return useMutation({
		mutationFn: (data: UpdateUserData) => {
			if (!user?.id) throw new Error('Usuario no autenticado');
			return usersApi.updateProfile(user.id, data);
		},

		onSuccess: (updateUser) => {
			// Invalidar y actualizar cache
			queryClient.setQueryData(queryKeys.profile, updateUser);

			// Actualizar store de auth
			useAuthStore.setState({ user: updateUser });

			// Notificar
			toast.success('Perfil actualizado correctamente');
		},

		onError: (error: unknown) => {

			toast.error(handleApiError(error, 'No se pudo actualizar el perfil'));
		}
	})
}

/**
 * Hook para cambiar contraseña
 */
export function useChangePassword() {
	return useMutation({
		mutationFn: (data: ChangePasswordData) => authApi.changePassword(data),
		onSuccess: () => {
			toast.success('Contraseña cambiada correctamente');
		},
		onError: (error: unknown) => {
			toast.error(handleApiError(error, 'No se pudo cambiar la contraseña'));
		}
	})
}

/**
 * Hook para subir imagen de perfil
 */
export function useUploadProfileImage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (file: File) => {
			// Validar tamaño (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				throw new Error('La imagen no puede superar 5MB')
			}

			// Validar tipo de archivo
			if (!file.type.startsWith('image/')) {
				throw new Error('El archivo debe ser una imagen')
			}

			return usersApi.uploadProfileImage(file);
		},
		onSuccess: (updateUser)=>{
			queryClient.setQueryData(queryKeys.profile, updateUser)
			useAuthStore.setState({user:updateUser})

			toast.success('Imagen actualizada')
		},
		onError: (error:unknown) =>{
			toast.error(handleApiError(error, 'No se pudo actualizar la imagen'))
		}
	})
}

export function useDeleteProfileImage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => usersApi.deleteProfileImage(),
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(queryKeys.profile, updatedUser);
			useAuthStore.setState({ user: updatedUser });

			toast.success('Imagen eliminada');
		},
		onError: (error: unknown) => {
			toast.error(handleApiError(error, 'No se pudo eliminar la imagen'));
		},
	});
}

/**
 * Hook para eliminar cuenta (soft delete)
 */
export function useDeleteAccount(){
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout)

	return useMutation({
		mutationFn: ()=>{
			if(!user?.id) throw new Error('Usuario no autenticado');

			return usersApi.deleteAccount(user.id)
		},
		onSuccess: ()=>{
			toast.success('Cuenta eliminada correctamente')
			logout()
		},
		onError: (error: unknown)=>{
			toast.error(handleApiError(error, 'No se pudo eliminar la cuenta'))
		}
	})
}
