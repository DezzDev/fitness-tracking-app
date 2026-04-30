// types/entities/user.types.ts
export type UserRole = 'user' | 'admin';

export interface User {
	id: string;
	email: string;
	name: string;
	age: number;
	role: 'user' | 'admin';
	profileImage: string | null,
	isActive: boolean;
	isDemo: boolean;
	demoExpiresAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
  tokenVersion: number;
};

// Para insert en DB
export type UserCreateData = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isDemo' | 'demoExpiresAt' | 'tokenVersion'
> & {
	password: string;
};

// Para update en DB
export type UserUpdateData = Partial<Omit<User, 'id' | 'isActive' | 'role' | 'createdAt' | 'updatedAt'>>;


// User row
export type UserRow = {
  id: string;
	email: string;
	name: string;
	age: number;
	role: 'user' | 'admin';
  profile_image?: string | null,
  is_active: boolean;
	is_demo?: boolean;
	demo_expires_at?: string | null;
	password_hash?: string;
	created_at: string;
	updated_at: string;
  token_version?: number;
};
