import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/AvailableFood.css';

const AvailableFood = () => {
    const { backendUrl, authToken } = useContext(AppContext);
    const [foodPosts, setFoodPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFoodPosts();
    }, []);

    const fetchFoodPosts = async () => {
        try {
            console.log('Fetching from:', `${backendUrl}/api/foodposts/all`); // DEBUG LINE
            const res = await axios.get(`${backendUrl}/api/foodposts/all`);
            console.log('Fetch response:', res.data); // DEBUG LINE
            
            if (res.data && res.data.success) {
                setFoodPosts(res.data.foodPosts);
            }
        } catch (error) {
            console.error('Fetch error:', error); // DEBUG LINE
            toast.error('Failed to fetch food posts');
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (postId) => {
        const token = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        console.log('=== DEBUG REQUEST FUNCTION ===');
        console.log('Post ID:', postId);
        console.log('Backend URL:', backendUrl);
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('User Data:', userData);
        console.log('Requesting URL:', `${backendUrl}/api/foodposts/request/${postId}`); // DEBUG LINE
        
        if (!token || !userData) {
            toast.error('Please log in to request food');
            navigate('/login');
            return;
        }

        if (userData.role !== 'receiver') {
            toast.error('Only receivers can request food');
            return;
        }

        try {
            console.log('Making PATCH request...'); // DEBUG LINE
            const res = await axios.patch(`${backendUrl}/api/foodposts/request/${postId}`, {}, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Request response:', res.data); // DEBUG LINE

            if (res.data && res.data.success) {
                toast.success('Food requested successfully!');
                fetchFoodPosts(); // Refresh the list
            }
        } catch (error) {
            console.error('=== FULL REQUEST ERROR ===');
            console.error('Error object:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            console.error('Request URL:', error.config?.url);
            console.error('Request method:', error.config?.method);
            console.error('Request headers:', error.config?.headers);
            
            toast.error(error.response?.data?.message || 'Failed to request food');
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

    if (loading) return <div className="loading">Loading available food...</div>;

    return (
        <div className="available-food-container">
            <div className="page-header">
                <h2>Available Food</h2>
                <h3>Find and request food donations from your community</h3>
            </div>
            
            <div className="food-grid">
                {foodPosts.map((post) => (
                    <div key={post._id} className="food-card">
                        {post.imageUrl && (
                            <img 
                                src={`${backendUrl}${post.imageUrl}`} 
                                alt={post.title} 
                                className="food-image" 
                            />
                        )}
                        <div className="food-details">
                            <h3>{post.title}</h3>
                            <p className="description">{post.description}</p>
                            <p><strong>Quantity:</strong> {post.quantity}</p>
                            <p><strong>Location:</strong> {post.location}</p>
                            <p><strong>Best Before:</strong> {new Date(post.bestBefore).toLocaleDateString()}</p>
                            <p><strong>Posted by:</strong> {post.postedBy.name}</p>
                            
                            {/* WORKFLOW PROGRESS ADDED HERE */}
                            <WorkflowProgress status={post.status} />
                            
                            <div className="food-actions">
                                {post.status === 'available' && (
                                    <button 
                                        onClick={() => {
                                            console.log('Button clicked for post:', post._id); // DEBUG LINE
                                            handleRequest(post._id);
                                        }}
                                        className="btn btn-primary request-btn"
                                    >
                                        Request Food
                                    </button>
                                )}
                                {post.status !== 'available' && (
                                    <div className="status-message">
                                        <p>This food is currently <strong>{post.status}</strong></p>
                                        {post.requestedBy && (
                                            <p className="requester-note">
                                                Requested by: {post.requestedBy.name}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <p className="post-date">
                                <strong>Posted:</strong> {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {foodPosts.length === 0 && (
                <div className="no-food-available">
                    <h3>No food available right now</h3>
                    <br />
                    <p>Check back later or encourage others to donate food to the community!</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn"
                    >
                        Go to Home
                    </button>
                </div>
            )}
        </div>
    );
};

export default AvailableFood;