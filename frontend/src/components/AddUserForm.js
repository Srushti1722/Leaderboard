import React, { useState } from 'react';

const AddUserForm = ({ onAddUser }) => {
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddUser(userName.trim());
      setUserName(''); // Clear form on success
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-user-form">
      <h3>➕ Add New User</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter user name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={isSubmitting}
          maxLength={50}
        />
        <button
          type="submit"
          className="add-user-button"
          disabled={isSubmitting || !userName.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default AddUserForm;