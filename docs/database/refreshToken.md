-- ====================================
-- MIGRATION: Add Refresh Token System
-- ====================================

-- 1. Agregar token_version a users
ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0;

-- 2. Crear tabla refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_id TEXT UNIQUE NOT NULL,
  parent_token_id TEXT,
  device_info TEXT,
  ip_address TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT 0,
  revoked_at DATETIME,
  revoked_reason TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Índices para optimización
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_id ON refresh_tokens(token_id);
CREATE INDEX idx_refresh_tokens_parent ON refresh_tokens(parent_token_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- 4. Crear tabla de eventos de seguridad (opcional, pero recomendado)
CREATE TABLE IF NOT EXISTS security_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'token_reuse', 'token_refresh'
  ip_address TEXT,
  user_agent TEXT,
  token_id TEXT,
  success BOOLEAN DEFAULT 1,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_created ON security_events(created_at);