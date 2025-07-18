import React from 'react';

const Leaderboard = ({ users }) => {
  const formatPoints = (points) => {
    return points === 1 ? '1 point' : `${points} points`;
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏅';
    }
  };

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>
      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users available</p>
        </div>
      ) : (
        <ul className="leaderboard-list">
          {users.map((user) => (
            <li
              key={user._id}
              className={`leaderboard-item rank-${user.rank <= 3 ? user.rank : 'other'}`}
            >
              <div className="user-info">
                <span className={`rank-badge rank-${user.rank <= 3 ? user.rank : 'other'}`}>
                  {getRankEmoji(user.rank)} #{user.rank}
                </span>
                <span className="user-name">{user.name}</span>
              </div>
              <div className="user-points">
                {formatPoints(user.totalPoints)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Leaderboard;