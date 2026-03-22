const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../config/db');
const router = express.Router();

// Get all users (for starting conversations) — excludes the current user
router.get('/users', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id != $1 ORDER BY name ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get chat users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get message history with a specific user
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT cm.*, u.name as sender_name
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE (cm.sender_id = $1 AND cm.receiver_id = $2)
          OR (cm.sender_id = $2 AND cm.receiver_id = $1)
       ORDER BY cm.created_at ASC`,
      [req.user.id, req.params.userId]
    );

    // Mark messages from the other user as read
    await pool.query(
      'UPDATE chat_messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE',
      [req.params.userId, req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent conversations (most recent message per unique partner)
router.get('/conversations', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (partner_id)
        partner_id, partner_name, partner_role, last_message, last_time, unread_count
       FROM (
         SELECT 
           CASE WHEN cm.sender_id = $1 THEN cm.receiver_id ELSE cm.sender_id END as partner_id,
           CASE WHEN cm.sender_id = $1 THEN r.name ELSE s.name END as partner_name,
           CASE WHEN cm.sender_id = $1 THEN r.role ELSE s.role END as partner_role,
           cm.message as last_message,
           cm.created_at as last_time,
           (SELECT COUNT(*) FROM chat_messages 
            WHERE sender_id = CASE WHEN cm.sender_id = $1 THEN cm.receiver_id ELSE cm.sender_id END
            AND receiver_id = $1 AND is_read = FALSE) as unread_count
         FROM chat_messages cm
         JOIN users s ON cm.sender_id = s.id
         JOIN users r ON cm.receiver_id = r.id
         WHERE cm.sender_id = $1 OR cm.receiver_id = $1
         ORDER BY cm.created_at DESC
       ) sub
       ORDER BY partner_id, last_time DESC`,
      [req.user.id]
    );
    // Re-sort by last_time descending
    rows.sort((a, b) => new Date(b.last_time) - new Date(a.last_time));
    res.json(rows);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread count
router.get('/unread', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) FROM chat_messages WHERE receiver_id = $1 AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
