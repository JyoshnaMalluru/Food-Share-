import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import '../styles/MyProfile.css';

const MyProfile = () => {
  const { authToken } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authToken) {
      navigate('/login');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [authToken, navigate]);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fa-solid fa-user"></i>
          </div>
          <h2>{user.name}</h2>
          <p className={`profile-role ${user.role} role-badge ${user.role}`}>{user.role}</p>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <strong>Name:</strong>
            <span>{user.name}</span>
          </div>
          <div className="detail-item">
            <strong>Email:</strong>
            <span>{user.email}</span>
          </div>
          <div className="detail-item">
            <strong>Role:</strong>
            <span className={`role-badge ${user.role}`}>{user.role}</span>
          </div>
          <div className="detail-item">
            <strong>Location:</strong>
            <span>{user.location || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <strong>Phone:</strong>
            <span>{user.phone || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
