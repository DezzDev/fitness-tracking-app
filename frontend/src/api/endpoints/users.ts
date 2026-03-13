import {apiClient, type ApiResponse} from '../client';
import {type User} from '@/types';

export interface UpdateUserData {
	name?: string;
	age?: number;
	profileImage?: string;
}

export interface ChangePasswordData {
	oldPassword: string;
	newPassword: string;
}

export const usersApi={
	/**
	 * Obtener perfil del usuario actual
	*/
	getProfile: async (): Promise<User> => {
		const response = await apiClient.get<ApiResponse<User>>('/users/me');
		return response.data.data!;
	},

	/**
	 * Actualizar datos del perfil
	 */
	updateProfile: async (userId: string, data: UpdateUserData) =>{
		const response = await apiClient.patch<ApiResponse<User>>(
			`/users/${userId}`,
			data
		)
	
		// Actualizar usuario en localStorage
		const updateUser = response.data.data!;
		localStorage.setItem('user', JSON.stringify(updateUser));

		return updateUser;	
	},

	/**
	 * Cambiar contraseña
	 */
	changePassword: async (data: ChangePasswordData): Promise<void>=>{
		await apiClient.patch('/users/me/password', data);
	},

	/**
	 * Subir imagen de perfil
	 */
	uploadProfileImage: async (file: File): Promise<string> =>{
		const formData = new FormData();
		formData.append('image', file)

		// Endpoint pendiente de implementar en la API
		const response = await apiClient.post<ApiResponse<{url: string}>>(
			'/users/me/profile-image',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)
		return response.data.data!.url;
	},

	/**
	 * Eliminar cuenta (soft delete)
	*/
	deleteAccount: async (userId: string):Promise<void> =>{
		await apiClient.delete(`/users/softDelete/${userId}`)
	}

}