// src/types/entities/securityEvent.types.ts

export type SecurityEventType = 
  | 'login' 
  | 'login_demo'
  | 'logout' 
  | 'token_refresh' 
  | 'token_reuse' 
  | 'password_change'
  | 'demo_expired_cleanup';

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: SecurityEventType;
  ipAddress: string | null;
  userAgent: string | null;
  tokenId: string | null;
  success: boolean;
  details: string | null;
  createdAt: Date;
}

export type SecurityEventRow = {
  id: string;
  user_id: string;
  event_type: SecurityEventType;
  ip_address: string | null;
  user_agent: string | null;
  token_id: string | null;
  success: number;
  details: string | null;
  created_at: string;
};

export type SecurityEventCreateData = {
  userId: string;
  eventType: SecurityEventType;
  ipAddress?: string | null;
  userAgent?: string | null;
  tokenId?: string | null;
  success?: boolean;
  details?: string | null;
};
