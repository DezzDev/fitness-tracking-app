// src/repositories/refreshToken.repository.ts
import { randomUUID } from "crypto";
import { execute } from "@/config/database";
import { RefreshToken, RefreshTokenRow } from "@/types/entities/refreshToken.type";
import { RefreshTokenCreateData } from "@/types/entities/refreshToken.type";

// ============================================
// mappers
// ============================================

const mapRowToRefreshToken = (row: RefreshTokenRow): RefreshToken => ({
  id: row.id,
  userId: row.user_id,
  tokenId: row.token_id,
  parentTokenId: row.parent_token_id,
  deviceInfo: row.device_info,
  ipAddress: row.ip_address,
  expiresAt: new Date(row.expires_at),
  createdAt: new Date(row.created_at),
  revoked: Boolean(row.revoked),
  revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
  revokedReason: row.revoked_reason
});

// ============================================
// Queries
// ============================================

export const queries = {

  /**
   * Crear nuevo refresh token
   */
  create: {
    sql: `
      INSERT INTO refresh_tokens 
        (id, user_id, token_id, parent_token_id, device_info, ip_address, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now')) 
      RETURNING *     
    `,
    args: (id: string, data: RefreshTokenCreateData) => [
      id,
      data.userId,
      data.tokenId,
      data.parentTokenId || null,
      data.deviceInfo || null,
      data.ipAddress || null,
      data.expiresAt.toISOString()
    ]
  },

  /**
   * Buscar token por tokenId (solo tokens no revocados )
   */
  findByTokenId: {
    sql: `SELECT * FROM refresh_tokens
          WHERE token_id = ? AND revoked = 0`,
    args: (tokenId: string) => [tokenId]
  },

  /**
   * Buscar token por tokenId (incluyendo tokens revocados)
   */
  findByTokenIdIncludeRevoked: {
    sql: `SELECT * FROM refresh_tokens
          WHERE token_id = ?`,
    args: (tokenId: string) => [tokenId]
  },

  /**
   * Obtener todos los tokens activos de un usuario
   * (útil para mostrar en el panel de usuario o para revocar todos los tokens)
   */
  findActiveByUserId: {
    sql: `SELECT * FROM refresh_tokens
          WHERE user_id = ? AND revoked = 0
          ORDER BY created_at DESC`,
    args: (userId: string) => [userId]
  },

  /**
   * Revocar un token por tokenId (marcar como revoked = 1, set revokedAt y revokedReason)
   * Nota: no se elimina el registro para mantener el historial y poder detectar reutilización de tokens
   */
  revokedByTokenId: {
    sql: `UPDATE refresh_tokens
          SET revoked = 1, revoked_at = datetime('now'), revoked_reason = ?
          WHERE token_id = ?`,
    args: (tokenId: string, reason: string) => [reason || null, tokenId]
  },

  /**
   * Revocar todos los tokens de un usuario (marcar como revoked = 1, set revokedAt y revokedReason)
   * Nota: no se elimina el registro para mantener el historial y poder detectar reutilización de tokens
   */
  revokedAllByUserId: {
    sql: `UPDATE refresh_tokens
          SET revoked = 1, revoked_at = datetime('now'), revoked_reason = ?
          WHERE user_id = ? AND revoked = 0`,
    args: (userId: string, reason: string) => [reason || null, userId]
  },

  /**
   * Revocar toda la familia de tokens (marcar como revoked = 1, set revokedAt y revokedReason)
   * Esto revoca el token actual y todos los tokens descendientes (basado en parent_token_id)
   * Útil para revocar toda la línea de tokens en caso de detección de reutilización de tokens
   */
  revokeTokenFamily: {
    sql: `WITH RECURSIVE token_family AS (
            SELECT id FROM refresh_tokens WHERE token_id = ? 
            UNION ALL
            SELECT rt.token_id FROM refresh_tokens rt
            INNER JOIN token_tree tt ON rt.parent_token_id = tt.token_id
            )
            UPDATE refresh_tokens
            SET revoked = 1,
              revoked_at = datetime('now'),
              revoked_reason = ?
            WHERE token_id IN (SELECT token_id FROM token_tree)
            RETURNING *`,
    args: (tokenId: string, reason: string = "token_reuse_detected") => [tokenId, reason]
  },

  /**
   * Encontrar el token raíz de una familia de tokens (el token sin parentTokenId)
   * Esto se usa para encontrar el token raíz cuando se detecta reutilización de tokens, para revocar toda la familia
   */
  findRootToken: {
    sql: `WITH RECURSIVE token_chain AS (
            SELECT * FROM refresh_tokens WHERE token_id = ?
            UNION ALL
            SELECT rt.* FROM refresh_tokens rt
            INNER JOIN token_chain tc ON rt.token_id = tc.parent_token_id
          )
          SELECT * FROM token_chain
          WHERE parent_token_id IS NULL
          LIMIT 1`,
    args: (tokenId: string) => [tokenId]
  },

  /**
   * Eliminar tokens expirados (limpieza)
   */
  deleteExpired: {
    sql: `DELETE FROM refresh_tokens
          WHERE expires_at < datetime('now')`,
    args: () => []
  },

  /**
   * Contar tokens activos por usuario (útil para limitar el número de dispositivos activos o para mostrar en el panel de usuario)
   */
  countActiveByUserId: {
    sql: `SELECT COUNT(*) as count FROM refresh_tokens
          WHERE user_id = ? AND revoked = 0`,
    args: (userId: string) => [userId]
  },



}

// ============================================
// RefreshToken Repository
// ============================================

export const refreshTokenRepository = {

  /**
   * Crear nuevo refresh token
   * @param data - Datos necesarios para crear el RefreshToken (sin id, createdAt, revoked, revokedAt, revokedReason)
   * @returns  El token creado (con id generado y campos por defecto)
   */
  create: async (data: RefreshTokenCreateData):Promise<RefreshToken> => {
    const tokenId = randomUUID();
   
    const result = await execute({
      sql: queries.create.sql,
      args: queries.create.args(tokenId,data)
    });

    const row = result.rows[0] as RefreshTokenRow | undefined;
    
    if (!row) {
      throw new Error('Failed to create refresh token');
    }
    return mapRowToRefreshToken(row);
  },

  /**
   * Buscar token por tokenId (solo tokens no revocados )
   * @param tokenId 
   * @returns RefreshToken si se encuentra y no está revocado, o null si no se encuentra o está revocado
    * Nota: para incluir tokens revocados, usar findByTokenIdIncludeRevoked
   */
  findByTokenId: async (tokenId:string): Promise<RefreshToken | null> =>{
    const result = await execute({
      sql: queries.findByTokenId.sql,
      args: queries.findByTokenId.args(tokenId)
    })
    
    const row = result.rows[0] as RefreshTokenRow | undefined;

    if (!row) return null;
    
    return mapRowToRefreshToken(row);
  }, 

  /**
   * Buscar token por tokenId (incluyendo tokens revocados)
   * @param tokenId 
   * @returns RefreshToken si se encuentra, o null si no se encuentra
   */
  findByTokenIdIncludeRevoked: async (tokenId:string): Promise<RefreshToken | null> =>{
    const result = await execute({
      sql: queries.findByTokenIdIncludeRevoked.sql,
      args: queries.findByTokenIdIncludeRevoked.args(tokenId)
    })  

    const row = result.rows[0] as RefreshTokenRow | undefined;

    if (!row) return null;

    return mapRowToRefreshToken(row);
  },

  /**
   * Obtener todos los tokens activos de un usuario
   * @param userId 
   * @returns Array de RefreshToken activos para ese usuario
   */
  findActiveByUserId: async (userId:string): Promise<RefreshToken[]> =>{
    const result = await execute({
      sql: queries.findActiveByUserId.sql,
      args: queries.findActiveByUserId.args(userId)
    })  
    
    const rows = result.rows as RefreshTokenRow[] | [];
    if (!rows || rows.length === 0) return [];
    return rows.map(mapRowToRefreshToken);
  },

  /**
   * Revocar un token por tokenId (marcar como revoked = 1, set revokedAt y revokedReason)
   * @param tokenId
   * reason - Razón para revocar el token (ej: 'user_logout', 'token_reuse_detected', etc)
   * Nota: no se elimina el registro para mantener el historial y poder detectar reutilización de tokens
   */
  revokedByTokenId: async (tokenId:string, reason:string): Promise<void> =>{
    await execute({
      sql: queries.revokedByTokenId.sql,
      args: queries.revokedByTokenId.args(tokenId, reason)
    })

  },

  /**
   * Revocar todos los tokens de un usuario (marcar como revoked = 1, set revokedAt y revokedReason)
   * @param userId 
   * @param reason - Razón para revocar los tokens (ej: 'password_change', 'admin_action', etc)
   * Nota: no se elimina el registro para mantener el historial y poder detectar reutilización de tokens
   */
  revokedAllByUserId: async (userId:string, reason:string): Promise<void> =>{
    await execute({
      sql: queries.revokedAllByUserId.sql,
      args: queries.revokedAllByUserId.args(userId, reason)
    })
  },

  /**
   * Revocar toda la familia de tokens (marcar como revoked = 1, set revokedAt y revokedReason)
   * Esto revoca el token actual y todos los tokens descendientes (basado en parent_token_id)
   * Útil para revocar toda la línea de tokens en caso de detección de reutilización de tokens
   * @param tokenId - tokenId del token raíz de la familia a revocar
   * @param reason - Razón para revocar los tokens (ej: 'token_reuse_detected')
   */
  revokeTokenFamily: async (tokenId:string, reason:string = "token_reuse_detected"): Promise<void> =>{
    // Encontrar el token raíz
    const token = await refreshTokenRepository.findByTokenIdIncludeRevoked(tokenId);
    if(!token) return; // Si no se encuentra el token, no hay nada que revocar

    // Si tiene padre, buscar el raíz (el token sin parentTokenId)
    let rootTokenId = tokenId
    if(token.parentTokenId){
      const rootToken = await refreshTokenRepository.findRootToken(tokenId);
      rootTokenId = rootToken?.tokenId || tokenId;
    }

    // Revocar todos los descendientes del token raíz (incluyendo el token raíz)
    await execute({
      sql: queries.revokeTokenFamily.sql,
      args: queries.revokeTokenFamily.args(rootTokenId, reason)
    })
  },

  /**
   * Encontrar el token raíz de una familia de tokens (el token sin parentTokenId)
   * Esto se usa para encontrar el token raíz cuando se detecta reutilización de tokens, para revocar toda la familia
   * @param tokenId - tokenId de cualquier token en la familia
   * @returns RefreshToken raíz si se encuentra, o null si no se encuentra
   */
  findRootToken: async (tokenId:string): Promise<RefreshToken | null> =>{
    const result = await execute({
      sql: queries.findRootToken.sql,
      args: queries.findRootToken.args(tokenId)
    })

    const row = result.rows[0] as RefreshTokenRow | undefined;
    if (!row) return null;

    return mapRowToRefreshToken(row);
  },

  /**
   * Eliminar tokens expirados (limpieza)
   * Nota: solo se eliminan los tokens que ya están revocados para mantener el historial de tokens activos y detectar reutilización de tokens
   */
  deleteExpired: async (): Promise<number> =>{
    const result = await execute({
      sql: queries.deleteExpired.sql,
      args: queries.deleteExpired.args()
    })
    return result.rowsAffected || 0;
  },

  /**
   * Contar tokens activos por usuario (útil para limitar el número de dispositivos activos o para mostrar en el panel de usuario)
   * @param userId
   * @return número de tokens activos para ese usuario
   */
  countActiveByUserId: async (userId:string): Promise<number> =>{
    const result = await execute({
      sql: queries.countActiveByUserId.sql,
      args: queries.countActiveByUserId.args(userId)
    })

    const row = result.rows[0] as { count: number } | undefined;
    return row ? row.count : 0;
  }

}