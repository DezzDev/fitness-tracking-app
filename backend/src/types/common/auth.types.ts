// src/types/common/auth.types.ts

export type Role = 'user' | 'admin';

export interface JWTPayload {
  userId: string;
  role: Role;
  tokenVersion:number;
}

export interface RefreshTokenPayload extends JWTPayload {
  tokenId: string;
}
