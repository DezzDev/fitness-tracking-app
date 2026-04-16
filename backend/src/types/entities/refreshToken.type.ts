// src/types/entities/refreshToken.type.ts

export interface RefreshToken {
  id: string;
  userId: string;
  tokenId: string;
  parentTokenId: string | null;
  deviceInfo: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;
  revoked: boolean;
  revokedAt: Date | null;
  revokedReason: string | null;
}

export type RefreshTokenRow = {
  id: string;
  user_id: string;
  token_id: string;
  parent_token_id: string | null;
  device_info: string | null;
  ip_address: string | null;
  expires_at: string;
  created_at: string;
  revoked: number;
  revoked_at: string | null;
  revoked_reason: string | null;
};

export type RefreshTokenCreateData = {
  userId: string;
  tokenId: string;
  expiresAt: Date;
  parentTokenId?: string | null;
  deviceInfo?: string | null;
  ipAddress?: string | null;
};