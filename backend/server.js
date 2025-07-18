const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Leaderboard:admin123@cluster0.06jyyt7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {

  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// History Schema
const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  pointsAwarded: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const History = mongoose.model('History', historySchema);

// Initialize default users
const initializeUsers = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      const defaultUsers = [
        { name: 'Rahul' },
        { name: 'Kamal' },
        { name: 'Sanak' },
        { name: 'Priya' },
        { name: 'Amit' },
        { name: 'Sneha' },
        { name: 'Rohan' },
        { name: 'Kavya' },
        { name: 'Arjun' },
        { name: 'Meera' }
      ];
      
      await User.insertMany(defaultUsers);
      console.log('Default users initialized');
    }
  } catch (error) {
    console.error('Error initializing users:', error);
  }
};

// Function to update ranks
const updateRanks = async () => {
  try {
    // Get all users sorted by total points (descending)
    const users = await User.find().sort({ totalPoints: -1 });
    
    // Update ranks
    for (let i = 0; i < users.length; i++) {
      await User.findByIdAndUpdate(users[i]._id, { rank: i + 1 });
    }
    
    return await User.find().sort({ rank: 1 });
  } catch (error) {
    console.error('Error updating ranks:', error);
    throw error;
  }
};

// Routes

// Get all users with rankings
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ rank: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new user
app.post('/api/users', async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = new User({ name });
    await user.save();
    
    // Update ranks after adding new user
    const updatedUsers = await updateRanks();
    
    // Emit updated leaderboard to all clients
    io.emit('leaderboardUpdate', updatedUsers);
    
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claim points for a user
app.post('/api/claim-points', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate random points (1-10)
    const randomPoints = Math.floor(Math.random() * 10) + 1;
    
    // Update user's total points
    user.totalPoints += randomPoints;
    await user.save();
    
    // Create history entry
    const historyEntry = new History({
      userId: user._id,
      userName: user.name,
      pointsAwarded: randomPoints
    });
    await historyEntry.save();
    
    // Update ranks
    const updatedUsers = await updateRanks();
    
    // Emit real-time update to all clients
    io.emit('leaderboardUpdate', updatedUsers);
    io.emit('pointsClaimed', {
      userName: user.name,
      pointsAwarded: randomPoints,
      newTotal: user.totalPoints
    });
    
    res.json({
      message: 'Points claimed successfully',
      pointsAwarded: randomPoints,
      newTotal: user.totalPoints,
      user: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get points history
app.get('/api/history', async (req, res) => {
  try {
    const history = await History.find()
      .sort({ timestamp: -1 })
      .limit(50); // Limit to last 50 entries
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard (sorted by points)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ totalPoints: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize app
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeUsers();
  await updateRanks(); // Initialize ranks on startup
});