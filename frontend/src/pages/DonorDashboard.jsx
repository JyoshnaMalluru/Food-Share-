import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const DonorDashboard = () => {
    const { backendUrl, authToken } = useContext(AppContext);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!authToken || !userData || userData.role !== 'donor') {
            toast.error('Access denied. Donors only.');
            navigate('/login');
            return;
        }
        fetchDonations();
    }, [authToken, navigate]);

    const fetchDonations = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${backendUrl}/api/foodposts/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                setDonations(res.data.posts);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch donations');
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
                <h2>Donor Dashboard</h2>
                <button 
                    onClick={() => navigate('/donate')} 
                    className="btn btn-success"
                >
                    + Donate Food
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{donations.length}</h3>
                    <p>Total Donations</p>
                </div>
                <div className="stat-card">
                    <h3>{donations.filter(d => d.status === 'available').length}</h3>
                    <p>Available</p>
                </div>
                <div className="stat-card">
                    <h3>{donations.filter(d => d.status === 'requested').length}</h3>
                    <p>Requested</p>
                </div>
                <div className="stat-card">
                    <h3>{donations.filter(d => d.status === 'delivered').length}</h3>
                    <p>Delivered</p>
                </div>
            </div>

            <div className="donations-section">
                <h3>My Donations</h3>
                <div className="donations-grid">
                    {donations.map((donation) => (
                        <div key={donation._id} className="donation-card">
                            {donation.imageUrl && (
                                <img 
                                    src={`${backendUrl}${donation.imageUrl}`} 
                                    alt={donation.title} 
                                    className="donation-image" 
                                />
                            )}
                            <div className="donation-details">
                                <h4>{donation.title}</h4>
                                <p><strong>Quantity:</strong> {donation.quantity}</p>
                                <p><strong>Location:</strong> {donation.location}</p>
                                <p><strong>Status:</strong> 
                                    <span className={`status ${donation.status}`}>
                                        {donation.status}
                                    </span>
                                </p>

                                {/* WORKFLOW PROGRESS ADDED HERE */}
                                <WorkflowProgress status={donation.status} />
                                
                                {donation.requestedBy && (
                                    <div className="requester-info">
                                        <p><strong>Requested by:</strong> {donation.requestedBy.name}</p>
                                        <p><strong>Contact:</strong> {donation.requestedBy.phone}</p>
                                    </div>
                                )}
                                
                                {donation.assignedVolunteer && (
                                    <div className="volunteer-info">
                                        <p><strong>Volunteer:</strong> {donation.assignedVolunteer.name}</p>
                                        <p><strong>Contact:</strong> {donation.assignedVolunteer.phone}</p>
                                    </div>
                                )}
                                
                                <p><strong>Posted:</strong> {new Date(donation.createdAt).toLocaleDateString()}</p>
                                
                                {donation.pickupDate && (
                                    <p><strong>Picked up:</strong> {new Date(donation.pickupDate).toLocaleDateString()}</p>
                                )}
                                
                                {donation.deliveryDate && (
                                    <p><strong>Delivered:</strong> {new Date(donation.deliveryDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {donations.length === 0 && (
                    <div className="no-donations">
                        <p>You haven't made any donations yet. Start helping your community!</p>
                        <button 
                            onClick={() => navigate('/donate')} 
                            className="btn btn-primary"
                        >
                            Make Your First Donation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonorDashboard;