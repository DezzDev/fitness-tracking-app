import { z } from 'zod';

/**
 * Schema para refresh token
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().optional(), // Opcional porque viene de cookie
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;