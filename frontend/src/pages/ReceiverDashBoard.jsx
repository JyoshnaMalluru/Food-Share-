import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const ReceiverDashboard = () => {
    const { backendUrl, authToken } = useContext(AppContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!authToken || !userData || userData.role !== 'receiver') {
            toast.error('Access denied. Receivers only.');
            navigate('/login');
            return;
        }
        fetchRequests();
    }, [authToken, navigate]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${backendUrl}/api/foodposts/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                setRequests(res.data.posts);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    // WORKFLOW PROGRESS COMPONENT
    const WorkflowProgress = ({ status }) => {
        const steps = ['available', 'requested', 'picked', 'delivered'];
        const currentIndex = steps.indexOf(status);

        return (
            <div className="workflow-progress">
                <div className="workflow-steps">
                    {steps.map((step, index) => (
                        <div key={step} className="workflow-step">
                            <div className={`step-circle ${index <= currentIndex ? 'active' : ''}`}>
                                {index < currentIndex ? '✓' : index + 1}
                            </div>
                            <span className={`step-label ${index <= currentIndex ? 'active' : ''}`}>
                                {step.charAt(0).toUpperCase() + step.slice(1)}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`step-line ${index < currentIndex ? 'completed' : ''}`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Receiver Dashboard</h2>
                <button 
                    onClick={() => navigate('/available')} 
                    className="btn btn-primary"
                >
                    Browse Available Food
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{requests.length}</h3>
                    <p>Total Requests</p>
                </div>
                <div className="stat-card">
                    <h3>{requests.filter(r => r.status === 'requested').length}</h3>
                    <p>Pending</p>
                </div>
                <div className="stat-card">
                    <h3>{requests.filter(r => r.status === 'picked').length}</h3>
                    <p>Being Delivered</p>
                </div>
                <div className="stat-card">
                    <h3>{requests.filter(r => r.status === 'delivered').length}</h3>
                    <p>Received</p>
                </div>
            </div>

            <div className="requests-section">
                <h3>My Food Requests</h3>
                <div className="requests-grid">
                    {requests.map((request) => (
                        <div key={request._id} className="request-card">
                            {request.imageUrl && (
                                <img 
                                    src={`${backendUrl}${request.imageUrl}`} 
                                    alt={request.title} 
                                    className="request-image" 
                                />
                            )}
                            <div className="request-details">
                                <h4>{request.title}</h4>
                                <p><strong>Quantity:</strong> {request.quantity}</p>
                                <p><strong>Donor:</strong> {request.postedBy.name}</p>
                                <p><strong>Pickup Location:</strong> {request.location}</p>
                                <p><strong>Status:</strong> 
                                    <span className={`status ${request.status}`}>
                                        {request.status}
                                    </span>
                                </p>

                                {/* WORKFLOW PROGRESS ADDED HERE */}
                                <WorkflowProgress status={request.status} />
                                
                                {request.assignedVolunteer && (
                                    <div className="volunteer-info">
                                        <p><strong>Volunteer:</strong> {request.assignedVolunteer.name}</p>
                                        <p><strong>Contact:</strong> {request.assignedVolunteer.phone}</p>
                                    </div>
                                )}
                                
                                <p><strong>Requested:</strong> {new Date(request.updatedAt).toLocaleDateString()}</p>
                                
                                {request.pickupDate && (
                                    <p><strong>Picked up:</strong> {new Date(request.pickupDate).toLocaleDateString()}</p>
                                )}
                                
                                {request.deliveryDate && (
                                    <p><strong>Delivered:</strong> {new Date(request.deliveryDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {requests.length === 0 && (
                    <div className="no-requests">
                        <p>You haven't made any food requests yet. Browse available food to get started!</p>
                        <button 
                            onClick={() => navigate('/available')} 
                            className="btn btn-primary"
                        >
                            Browse Available Food
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceiverDashboard;