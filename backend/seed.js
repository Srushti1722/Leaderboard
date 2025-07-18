const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('Connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  rank: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// Create users with random points (0 to 10)
const users = [
  { name: 'Rahul', totalPoints: Math.floor(Math.random() * 11) },
  { name: 'Kamal', totalPoints: Math.floor(Math.random() * 11) },
  { name: 'Sanak', totalPoints: Math.floor(Math.random() * 11) },
  { name: 'Priya', totalPoints: Math.floor(Math.random() * 11) },
  { name: 'Amit', totalPoints: Math.floor(Math.random() * 11) },
  { name: 'Sneha', totalPoints: Math.floor(Math.random() * 11) },
  { name: 'Rohan', totalPoints: Math.floor(Math.random() * 11) },
  { name: 'Kavya', totalPoints: Math.floor(Math.random() * 11) },
  { name: 'Arjun', totalPoints: Math.floor(Math.random() * 11) },
  { name: 'Meera', totalPoints: Math.floor(Math.random() * 11) }
];

// Seeding function
const seedUsers = async () => {
  try {
    await User.deleteMany(); // Clear existing data (optional)
    await User.insertMany(users);
    console.log('✅ Users with points seeded successfully');
  } catch (err) {
    console.error('Error seeding users:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedUsers();
