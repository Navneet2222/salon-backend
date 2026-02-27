require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

app.use(cors()); 
app.use(express.json()); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on('joinShopRoom', (shopId) => {
    socket.join(shopId);
    console.log(`User joined room for shop: ${shopId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// THIS IS THE FIXED ROUTE
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Salon Marketplace API is running!' });
}); 

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const shopRoutes = require('./routes/shopRoutes');
app.use('/api/shops', shopRoutes);

const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/services', serviceRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});