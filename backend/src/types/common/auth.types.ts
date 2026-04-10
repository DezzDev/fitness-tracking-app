export interface JWTPayload {
  userId: string;
  role: string;
  tokenVersion:number;
}

export interface RefreshTokenPayload extends JWTPayload {
  tokenId: string;
}

export interface RefreshToken {
  id:string;
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

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'login' | 'logout' | 'token_reuse' | 'token_refresh' | 'password_change';
  ipAddress: string | null;
  userAgent: string | null;
  tokenId: string | null;
  success: boolean;
  details: string | null;
  createdAt: Date;
}

// ============================================
// row type
// ============================================

export type RefreshTokenRow = {
  id:string;
  user_id: string;
  token_id: string;
  parent_token_id: string | null;
  device_info: string | null;
  ip_address: string | null;  
  expires_at: string;
  created_at: string;
  revoked: number; // 0 o 1
  revoked_at: string | null;
  revoked_reason: string | null;
}

export interface SecurityEventRow {
  id: string;
  user_id:string;
  event_type: 'login' | 'logout' | 'token_reuse' | 'token_refresh' | 'password_change';
  ip_address: string | null;
  user_agent: string | null;
  token_id: string | null;
  success: number; // 0 o 1
  details: string | null;
  created_at: string;
}
