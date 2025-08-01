import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const VolunteerDashboard = () => {
    const { backendUrl, authToken } = useContext(AppContext);
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState({ pickedCount: 0, deliveredCount: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!authToken || !userData || userData.role !== 'volunteer') {
            toast.error('Access denied. Volunteers only.');
            navigate('/login');
            return;
        }
        fetchAssignments();
        fetchStats();
    }, [authToken, navigate]);

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${backendUrl}/api/foodposts/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                console.log('Volunteer assignments:', res.data.posts); // DEBUG
                setAssignments(res.data.posts);
            }
        } catch (error) {
            console.error('Fetch assignments error:', error);
            toast.error('Failed to fetch assignments');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${backendUrl}/api/foodposts/volunteer-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    };

    const handleMarkPicked = async (postId) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.patch(`${backendUrl}/api/foodposts/picked/${postId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                toast.success('Marked as picked up!');
                fetchAssignments();
                fetchStats();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to mark as picked');
        }
    };

    const handleMarkDelivered = async (postId) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.patch(`${backendUrl}/api/foodposts/delivered/${postId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                toast.success('Marked as delivered!');
                fetchAssignments();
                fetchStats();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to mark as delivered');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Volunteer Dashboard</h2>
            </div>

            {/* PICKUP/DELIVERY STATS */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{assignments.length}</h3>
                    <p>Total Assignments</p>
                </div>
                <div className="stat-card picked">
                    <h3>{stats.pickedCount}</h3>
                    <p>Items Picked Up</p>
                </div>
                <div className="stat-card delivered">
                    <h3>{stats.deliveredCount}</h3>
                    <p>Items Delivered</p>
                </div>
                <div className="stat-card pending">
                    <h3>{assignments.filter(a => a.status === 'requested').length}</h3>
                    <p>Pending Pickups</p>
                </div>
            </div>

            <div className="assignments-section">
                <h3>My Assignments</h3>
                <div className="assignments-grid">
                    {assignments.map((assignment) => (
                        <div key={assignment._id} className="assignment-card">
                            {assignment.imageUrl && (
                                <img 
                                    src={`${backendUrl}${assignment.imageUrl}`} 
                                    alt={assignment.title} 
                                    className="assignment-image" 
                                />
                            )}
                            <div className="assignment-details">
                                <h4>{assignment.title}</h4>
                                <p><strong>Quantity:</strong> {assignment.quantity}</p>
                                
                                {/* FIXED: Added null checking for postedBy */}
                                {assignment.postedBy && (
                                    <div className="donor-info">
                                        <p><strong>Pickup from:</strong> {assignment.postedBy.name}</p>
                                        <p><strong>Location:</strong> {assignment.location}</p>
                                        <p><strong>Contact:</strong> {assignment.postedBy.phone}</p>
                                    </div>
                                )}
                                
                                {/* FIXED: Added null checking for requestedBy */}
                                {assignment.requestedBy ? (
                                    <div className="receiver-info">
                                        <p><strong>Deliver to:</strong> {assignment.requestedBy.name}</p>
                                        <p><strong>Contact:</strong> {assignment.requestedBy.phone}</p>
                                    </div>
                                ) : (
                                    <div className="receiver-info">
                                        <p><strong>Deliver to:</strong> <span className="not-assigned">Not assigned yet</span></p>
                                    </div>
                                )}
                                
                                <p><strong>Status:</strong> 
                                    <span className={`status ${assignment.status}`}>
                                        {assignment.status}
                                    </span>
                                </p>
                                
                                <div className="assignment-actions">
                                    {assignment.status === 'requested' && (
                                        <button 
                                            onClick={() => handleMarkPicked(assignment._id)}
                                            className="btn btn-warning"
                                        >
                                            Mark as Picked Up
                                        </button>
                                    )}
                                    
                                    {assignment.status === 'picked' && (
                                        <button 
                                            onClick={() => handleMarkDelivered(assignment._id)}
                                            className="btn btn-success"
                                        >
                                            Mark as Delivered
                                        </button>
                                    )}
                                    
                                    {assignment.status === 'available' && (
                                        <div className="status-note">
                                            <p>Waiting for someone to request this food</p>
                                        </div>
                                    )}
                                    
                                    {assignment.status === 'delivered' && (
                                        <div className="status-note completed">
                                            <p>✅ Successfully delivered!</p>
                                        </div>
                                    )}
                                </div>
                                
                                {assignment.pickupDate && (
                                    <p><strong>Picked up:</strong> {new Date(assignment.pickupDate).toLocaleDateString()}</p>
                                )}
                                
                                {assignment.deliveryDate && (
                                    <p><strong>Delivered:</strong> {new Date(assignment.deliveryDate).toLocaleDateString()}</p>
                                )}
                                
                                <p className="assignment-created">
                                    <strong>Assigned:</strong> {new Date(assignment.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {assignments.length === 0 && (
                    <div className="no-assignments">
                        <p>No assignments yet. You'll be notified when food needs to be picked up.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerDashboard;