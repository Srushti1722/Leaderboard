import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components
import UserSelector from './components/UserSelector';
import Leaderboard from './components/Leaderboard';
import AddUserForm from './components/AddUserForm';
import PointsHistory from './components/PointsHistory';

const API_BASE_URL = 'https://leaderboard-yi02.onrender.com/api';


function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('https://leaderboard-yi02.onrender.com');

    setSocket(newSocket);

    // Listen for real-time updates
    newSocket.on('leaderboardUpdate', (updatedUsers) => {
      setLeaderboard(updatedUsers);
      setUsers(updatedUsers);
    });

    newSocket.on('pointsClaimed', (data) => {
      toast.success(`🎉 ${data.userName} earned ${data.pointsAwarded} points! Total: ${data.newTotal}`);
      fetchHistory(); // Refresh history
    });

    return () => newSocket.close();
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchHistory();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  // Fetch points history
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Handle claiming points
  const handleClaimPoints = async () => {
    if (!selectedUser) {
      toast.warning('Please select a user first!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/claim-points`, {
        userId: selectedUser
      });

      // The real-time update will be handled by socket.io
      // toast.success(`${response.data.pointsAwarded} points claimed for ${response.data.user.name}!`);
      
    } catch (error) {
      console.error('Error claiming points:', error);
      toast.error('Failed to claim points');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new user
  const handleAddUser = async (userName) => {
    try {
      await axios.post(`${API_BASE_URL}/users`, { name: userName });
      toast.success(`User "${userName}" added successfully!`);
      // The real-time update will be handled by socket.io
    } catch (error) {
      console.error('Error adding user:', error);
      if (error.response?.data?.error === 'User already exists') {
        toast.error('User already exists!');
      } else {
        toast.error('Failed to add user');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Leaderboard System</h1>
        <p>Select a user and claim random points! Scroll Down!</p>
      </header>

      <main className="App-main">
        <div className="container">
          {/* User Selection and Claim Section */}
          <div className="claim-section">
            <div className="claim-card">
              <h2>Claim Points</h2>
              <UserSelector
                users={users}
                selectedUser={selectedUser}
                onUserSelect={setSelectedUser}
              />
              <button
                className="claim-button"
                onClick={handleClaimPoints}
                disabled={loading || !selectedUser}
              >
                {loading ? 'Claiming...' : '🎲 Claim Random Points'}
              </button>
            </div>

            {/* Add User Form */}
            <AddUserForm onAddUser={handleAddUser} />
          </div>

          {/* Leaderboard Section */}
          <div className="leaderboard-section">
            <Leaderboard users={leaderboard} />
          </div>

          {/* Points History Section */}
          <div className="history-section">
            <PointsHistory history={history} />
          </div>
        </div>
      </main>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;