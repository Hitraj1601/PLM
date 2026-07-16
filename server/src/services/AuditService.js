const pool = require('../config/db');

class AuditService {
  static async log({ action, recordType, recordId, oldValue, newValue, userId, userName }) {
    // Execute an INSERT query to the audit_logs table
    // $1, $2, etc. are parameterized inputs used safely to prevent SQL injection vulnerabilities
    const result = await pool.query(
      `INSERT INTO audit_logs (action, record_type, record_id, old_value, new_value, user_id, user_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        action, 
        recordType, 
        recordId, 
        // Convert oldValue and newValue objects into JSON strings for database storage, if they exist
        oldValue ? JSON.stringify(oldValue) : null, 
        newValue ? JSON.stringify(newValue) : null, 
        userId, 
        userName
      ]
    );
    // Return the newly inserted row containing the log details
    return result.rows[0];
  }

  static async getLogsForRecord(recordType, recordId) {
    // Fetch all logs matching the specific record_type and record_id
    // Results are ordered by created_at ascending (oldest to newest) to show history chronologically
    const result = await pool.query(
      `SELECT * FROM audit_logs WHERE record_type = $1 AND record_id = $2 ORDER BY created_at ASC`,
      [recordType, recordId]
    );
    // Return the array of matching logs
    return result.rows;
  }

  static async getLogsForECO(ecoId) {
    // Helper method: specifically fetches logs for Engineering Change Orders ('eco')
    return this.getLogsForRecord('eco', ecoId);
  }

  static async getAllLogs(limit = 100) {
    // Fetches a general list of all audit logs ordered by newest first (descending)
    // Limits the output to avoid overwhelming the database or frontend (defaults to 100 rows)
    const result = await pool.query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`, [limit]
    );
    return result.rows;
  }
}

module.exports = AuditService;
