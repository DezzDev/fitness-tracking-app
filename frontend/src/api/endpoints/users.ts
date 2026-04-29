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
	 * Subir imagen de perfil
	 */
	uploadProfileImage: async (file: File): Promise<User> =>{
		const formData = new FormData();
		formData.append('profileImage', file)

		const response = await apiClient.post<ApiResponse<User>>(
			'/users/me/profile-image',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)

		const updatedUser = response.data.data!;
		localStorage.setItem('user', JSON.stringify(updatedUser));

		return updatedUser;
	},

	/**
	 * Eliminar imagen de perfil
	 */
	deleteProfileImage: async (): Promise<User> => {
		const response = await apiClient.delete<ApiResponse<User>>('/users/me/profile-image');

		const updatedUser = response.data.data!;
		localStorage.setItem('user', JSON.stringify(updatedUser));

		return updatedUser;
	},

	/**
	 * Eliminar cuenta (soft delete)
	*/
	deleteAccount: async (userId: string):Promise<void> =>{
		await apiClient.delete(`/users/softDelete/${userId}`)
	}

}
