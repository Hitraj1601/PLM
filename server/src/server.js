// Import Express for web server capability
const express = require('express');
// Import CORS to allow cross-origin requests from the React frontend
const cors = require('cors');
// Import Node HTTP module to wrap Express for Socket.io
const http = require('http');
// Import Socket.io for real-time WebSocket communication
const { Server } = require('socket.io');
// Import JWT for socket authentication
const jwt = require('jsonwebtoken');
// Load environment variables from a .env file into process.env
require('dotenv').config();

// Import route handlers for various modules
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const bomRoutes = require('./routes/bom.routes');
const ecoRoutes = require('./routes/eco.routes');
const approvalRoutes = require('./routes/approval.routes');
const reportRoutes = require('./routes/report.routes');
const chatRoutes = require('./routes/chat.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Import authentication and role-checking middleware
const auth = require('./middleware/auth');
const roleGuard = require('./middleware/roleGuard');
// Import PostgreSQL database connection pool
const pool = require('./config/db');

const app = express();
// Wrap Express in a raw HTTP server so Socket.io can attach to it
const server = http.createServer(app);
// Initialize Socket.io on the HTTP server with CORS allowance
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});
const PORT = process.env.PORT || 5000;

// Global Middleware configuration
// Allow requests from the local development ports
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
// Parse incoming JSON requests and attach object to req.body
app.use(express.json());

// Main Resource Routing
// Map feature routes to their respective modular routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bom', bomRoutes);
app.use('/api/eco', ecoRoutes);
// Approvals are treated as a sub-route of ECOs
app.use('/api/eco', approvalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', analyticsRoutes);

// Settings routes (ECO Stages management)

// Retrieve all configured ECO stages, sorted by the defined step order
app.get('/api/settings/stages', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM eco_stages ORDER BY order_index ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin only: Add a new ECO stage into the workflow
app.post('/api/settings/stages', auth, roleGuard('admin'), async (req, res) => {
  try {
    const { name, order_index, requires_approval } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO eco_stages (name, order_index, requires_approval)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, order_index, requires_approval || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin only: Edit an existing ECO workflow stage
app.put('/api/settings/stages/:id', auth, roleGuard('admin'), async (req, res) => {
  try {
    const { name, order_index, requires_approval } = req.body;
    const { rows } = await pool.query(
      `UPDATE eco_stages SET name = COALESCE($1, name), order_index = COALESCE($2, order_index),
       requires_approval = COALESCE($3, requires_approval) WHERE id = $4 RETURNING *`,
      [name, order_index, requires_approval, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Stage not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin only: Remove an ECO stage from the workflow entirely
app.delete('/api/settings/stages/:id', auth, roleGuard('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM eco_stages WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Stage not found' });
    res.json({ message: 'Stage deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============== Socket.io Real-Time Chat ==============

// Track online users: map of userId -> socketId
const onlineUsers = new Map();

// Authenticate socket connections using JWT before allowing events
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  onlineUsers.set(userId, socket.id);

  // Broadcast updated online users list to all connected clients
  io.emit('online_users', Array.from(onlineUsers.keys()));

  // Handle sending a new message
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, message } = data;
      // Persist the message in the database
      const { rows: [saved] } = await pool.query(
        `INSERT INTO chat_messages (sender_id, receiver_id, message)
         VALUES ($1, $2, $3) RETURNING *`,
        [userId, receiverId, message]
      );
      // Add sender name to the message for display
      saved.sender_name = socket.user.name;

      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('new_message', saved);
      }
      // Send confirmation back to the sender
      socket.emit('message_sent', saved);
    } catch (err) {
      console.error('Socket send_message error:', err);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle user typing indicator
  socket.on('typing', (data) => {
    const receiverSocket = onlineUsers.get(data.receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user_typing', { userId, name: socket.user.name });
    }
  });

  // Clean up when a user disconnects
  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

// Start the HTTP + WebSocket server
server.listen(PORT, () => {
  console.log(`🚀 PLM Server running on port ${PORT}`);
});
