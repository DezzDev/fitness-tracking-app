import { randomUUID } from "crypto";
import { execute } from "@/config/database";
import { SecurityEvent, SecurityEventCreateData, SecurityEventRow } from "@/types/entities/securityEvent.types";

//=================================
// Mappers
const mapRowToSecurityEvent = (row: SecurityEventRow): SecurityEvent => ({
  id: row.id,
  userId: row.user_id,
  eventType: row.event_type,
  ipAddress: row.ip_address,
  userAgent: row.user_agent,
  tokenId: row.token_id,
  success: Boolean(row.success), // Convert 0/1 to boolean
  details: row.details,
  createdAt: new Date(row.created_at)
});

//=================================
// Queries
//=================================
export const queries = {
  // Create a new security event
  create: {
    sql: `INSERT INTO security_events
      (id, user_id, event_type, ip_address, user_agent, token_id, success, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      RETURNING *
      `,
    args: (id:string, data:SecurityEventCreateData) => [
      id,
      data.userId,
      data.eventType,
      data.ipAddress || null,
      data.userAgent || null,
      data.tokenId || null,
      data.success === false ? 0 : 1, // Convert boolean to 0/1
      data?.details || null
    ]
  },

  // Get security events by user Id wit limit
  findByUserId: {
    sql: `SELECT * FROM security_events WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    args: (userId: string, limit: number) => [userId, limit]
  }
}

//=================================
// Repository
//=================================
export const securityEventRepository = {
  // Create a new security event
  create: async (data: SecurityEventCreateData): Promise<SecurityEvent> => {
    const id = randomUUID();
   
    const results = await execute({
      sql: queries.create.sql,
      args: queries.create.args(id, data)
    });

    const row = results.rows[0] as SecurityEventRow | undefined;
    if (!row) {
      throw new Error('Failed to create security event');
    }


    return mapRowToSecurityEvent(row);
  },

  // Get security events by user Id with limit
  findByUserId: async (userId: string, limit: number = 50): Promise<SecurityEvent[]> => {
    const result = await execute({
      sql: queries.findByUserId.sql,
      args: queries.findByUserId.args(userId, limit)
    });

    const rows = result.rows as SecurityEventRow[] | [];

    if(!rows || rows.length === 0) return [];

    return rows.map(mapRowToSecurityEvent);
  }
}