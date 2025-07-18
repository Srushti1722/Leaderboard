import React from 'react';

const UserSelector = ({ users, selectedUser, onUserSelect }) => {
  return (
    <div className="user-selector">
      <label htmlFor="user-select">Select User:</label>
      <select
        id="user-select"
        value={selectedUser}
        onChange={(e) => onUserSelect(e.target.value)}
      >
        <option value="">-- Choose a user --</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name} ({user.totalPoints} points)
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserSelector;