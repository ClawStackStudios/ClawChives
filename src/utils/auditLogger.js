export function createAuditLogger(db) {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (
      timestamp, event_type, actor, actor_type, resource,
      action, outcome, ip_address, user_agent, details
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  return {
    log(eventType, data) {
      // Redact sensitive payload info
      let safeDetails = null;
      if (data.details) {
        safeDetails = { ...data.details };
        if (safeDetails.keyHash) safeDetails.keyHash = "***REDACTED***";
        if (safeDetails.humanKey) safeDetails.humanKey = "***REDACTED***";
      }

      stmt.run(
        new Date().toISOString(),
        eventType,
        data.actor || null,
        data.actor_type || null,
        data.resource || null,
        data.action,
        data.outcome,
        data.ip_address || null,
        data.user_agent || null,
        safeDetails ? JSON.stringify(safeDetails) : null
      );
    },

    query(filters = {}) {
      let sql = "SELECT * FROM audit_logs WHERE 1=1";
      const params = [];

      if (filters.event_type) {
        sql += " AND event_type = ?";
        params.push(filters.event_type);
      }

      if (filters.actor) {
        sql += " AND actor = ?";
        params.push(filters.actor);
      }

      if (filters.outcome) {
        sql += " AND outcome = ?";
        params.push(filters.outcome);
      }

      if (filters.start_date) {
        sql += " AND timestamp >= ?";
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        sql += " AND timestamp <= ?";
        params.push(filters.end_date);
      }

      sql += " ORDER BY timestamp DESC LIMIT ?";
      params.push(filters.limit || 100);

      return db.prepare(sql).all(...params);
    },

    cleanup(retentionDays = 90) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = db.prepare("DELETE FROM audit_logs WHERE timestamp < ?")
        .run(cutoffDate.toISOString());

      return result.changes;
    }
  };
}
