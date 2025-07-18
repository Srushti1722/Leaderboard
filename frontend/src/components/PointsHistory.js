import React from 'react';

const PointsHistory = ({ history }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPoints = (points) => {
    return points === 1 ? '1 point' : `${points} points`;
  };

  return (
    <div className="history">
      <h2>📈 Points History</h2>
      {history.length === 0 ? (
        <div className="empty-state">
          <p>No points claimed yet. Start claiming points to see history!</p>
        </div>
      ) : (
        <ul className="history-list">
          {history.map((entry) => (
            <li key={entry._id} className="history-item">
              <div className="history-info">
                <span className="points-badge">
                  +{entry.pointsAwarded}
                </span>
                <span className="history-user">
                  {entry.userName}
                </span>
                <span className="history-description">
                  earned {formatPoints(entry.pointsAwarded)}
                </span>
              </div>
              <div className="history-time">
                {formatTime(entry.timestamp)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PointsHistory;