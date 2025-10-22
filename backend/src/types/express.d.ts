// src/types/express.d.ts

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: string;
				email: string;
				role: 'user' | 'admin';
			}
		}
	}
}

export { };

// ¿Por qué esto ?

// 	Permite que req.user sea type - safe
// TypeScript reconocerá req.user en todos los controllers