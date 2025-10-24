// src/test-utils/fixtures.ts
import { RegisterInput, LoginInput } from "@/schemas/user.schema";

/**
 * Datos validos de registro
 */
export const validateRegisterData: RegisterInput ={
	email: 'newuser@example.com',
	password: 'Password123',
	name: 'New User',
	age: 25,
	role: 'user',
	profile_image: 'http://localhost:3000/public/images/default-avatar.jpg',
	acceptTerms: true
}

/**
 * Datos validos de login
 */
export const validateLoginData: LoginInput ={
	email: 'newuser@example.com',
	password: 'Password123'
}

/**
 * Datos inválidos (para test negativos)
 */
export const invalidRegtisterData = {
	emailMissing: {...validateRegisterData, email: undefined},
	emailInvalid: {...validateRegisterData, email: 'invalidemail'},
	passwordShort: {...validateRegisterData, password: 'short'},
	passwordNoUppercase: {...validateRegisterData, password: 'nopassword123'},
	passwordNoLowercase: {...validateRegisterData, password: 'PASSWORD123'},
	areYoung: {...validateRegisterData, age: 14},
	termsNotAccepted: {...validateRegisterData, acceptTerms: false},
}