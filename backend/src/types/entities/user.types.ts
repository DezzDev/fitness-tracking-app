export type UserRole = 'user' | 'admin';

export interface User {
	id: string;
	email: string;
	name: string;
	age: number;
	role: 'user' | 'admin';
	profile_image: string,
	is_active: boolean;
	createdAt: Date;
	updatedAt: Date;
};

// Para insert en DB
export type UserCreateData = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
	password: number;
};

// Para update en DB
export type UserUpdateData = Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;


// Row de la DB (si usas snake_case)
export type UserRow = Omit<User, 'createdAt' | 'updatedAt'> & {
	password_hash: string;
	created_at: string;
	updated_at: string;
};