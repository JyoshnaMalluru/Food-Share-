import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
    const { backendUrl, authToken } = useContext(AppContext);
    const [allPosts, setAllPosts] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState('');
    const [selectedPost, setSelectedPost] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!authToken || !userData || userData.role !== 'admin') {
            toast.error('Access denied. Admins only.');
            navigate('/login');
            return;
        }
        fetchData();
    }, [authToken, navigate, backendUrl]);

    // Fetch both posts and volunteers together
    const fetchData = async () => {
        setLoading(true);
        setApiError(null);
        await Promise.all([fetchAllPosts(), fetchVolunteers()]);
        setLoading(false);
    };

    const fetchAllPosts = async () => {
        try {
            const token = localStorage.getItem('authToken');
            
            // Try the admin route first
            let res;
            try {
                res = await axios.get(`${backendUrl}/api/foodposts/admin/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (adminError) {                
                res = await axios.get(`${backendUrl}/api/foodposts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            let posts = [];
            if (res.data && res.data.success) {
                posts = res.data.foodPosts || res.data.posts || res.data.data || [];
            } else if (res.data && Array.isArray(res.data)) {
                posts = res.data;
            } else if (res.data) {
                posts = res.data.foodPosts || res.data.posts || res.data.data || [];
            }
            
            setAllPosts(posts);
            
        } catch (error) {
            console.error('Error fetching posts:', error);
            setApiError(error.message);
            toast.error('Failed to fetch posts: ' + error.message);
        }
    };

    const fetchVolunteers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('👥 Fetching volunteers from:', `${backendUrl}/api/users/volunteers`);
            
            const res = await axios.get(`${backendUrl}/api/users/volunteers`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('✅ Volunteers response:', res.data);

            let volunteers = [];
            if (res.data && res.data.success) {
                volunteers = res.data.volunteers || res.data.users || res.data.data || [];
            } else if (res.data && Array.isArray(res.data)) {
                volunteers = res.data;
            }

            console.log('👥 Volunteers found:', volunteers.length);
            setVolunteers(volunteers);
            
        } catch (error) {
            console.error('💥 Error fetching volunteers:', error);
            toast.error('Failed to fetch volunteers: ' + error.message);
        }
    };

    // Calculate stats from current allPosts state
    const getStats = () => {
        if (!allPosts || allPosts.length === 0) {
            console.log('📊 No posts for stats calculation');
            return {
                totalPosts: 0,
                totalVolunteers: volunteers.length,
                completedDeliveries: 0,
                expiredPosts: 0,
                availablePosts: 0,
                requestedPosts: 0,
                deliveredPosts: 0
            };
        }

        const currentDate = new Date();
        console.log('📊 Calculating stats for', allPosts.length, 'posts');
        
        const stats = {
            totalPosts: allPosts.length,
            totalVolunteers: volunteers.length,
            completedDeliveries: allPosts.filter(p => p.status === 'delivered').length,
            expiredPosts: allPosts.filter(p => {
                const isExpired = new Date(p.bestBefore) < currentDate;
                if (isExpired) console.log('📅 Expired post:', p.title, p.bestBefore);
                return isExpired;
            }).length,
            availablePosts: allPosts.filter(p => p.status === 'available').length,
            requestedPosts: allPosts.filter(p => p.status === 'requested').length,
            deliveredPosts: allPosts.filter(p => p.status === 'delivered').length
        };
        
        console.log('📊 Final stats:', stats);
        return stats;
    };

    // Get filtered posts for dropdown
    const getRequestedUnassignedPosts = () => {
        const filtered = allPosts.filter(post => {
            const isRequested = post.status === 'requested';
            const hasNoVolunteer = !post.assignedVolunteer;
            const hasPostedBy = post.postedBy;
            
            console.log('🔍 Post filter:', {
                title: post.title,
                status: post.status,
                isRequested,
                hasNoVolunteer,
                hasPostedBy,
                passes: isRequested && hasNoVolunteer && hasPostedBy
            });
            
            return isRequested && hasNoVolunteer && hasPostedBy;
        });
        
        console.log('📋 Requested unassigned posts:', filtered.length);
        return filtered;
    };

    // Get current stats
    const stats = getStats();
    const requestedUnassignedPosts = getRequestedUnassignedPosts();

    const handleAssignVolunteer = async () => {
        if (!selectedPost || !selectedVolunteer) {
            toast.error('Please select both a post and a volunteer');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.post(`${backendUrl}/api/foodposts/assign-volunteer`, {
                postId: selectedPost,
                volunteerId: selectedVolunteer
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                toast.success('Volunteer assigned successfully!');
                setSelectedPost('');
                setSelectedVolunteer('');
                fetchAllPosts();
            }
        } catch (error) {
            console.error('Error assigning volunteer:', error);
            toast.error(error.response?.data?.message || 'Failed to assign volunteer');
        }
    };

    // DELETE SINGLE POST WITH TOAST CONFIRMATION
    const handleDeletePost = async (postId, postTitle) => {
        toast(
            ({ closeToast }) => (
                <div>
                    <p>Delete "{postTitle}"?</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button 
                            onClick={() => {
                                closeToast();
                                performDeletePost(postId, postTitle);
                            }}
                            style={{ 
                                background: '#e74c3c', 
                                color: 'white', 
                                border: 'none', 
                                padding: '5px 15px', 
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Yes, Delete
                        </button>
                        <button 
                            onClick={closeToast}
                            style={{ 
                                background: '#95a5a6', 
                                color: 'white', 
                                border: 'none', 
                                padding: '5px 15px', 
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                position: "top-center",
                autoClose: false,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
            }
        );
    };

    const performDeletePost = async (postId, postTitle) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.delete(`${backendUrl}/api/foodposts/admin/delete/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                toast.success(`Post "${postTitle}" deleted successfully!`);
                fetchAllPosts();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error(error.response?.data?.message || 'Failed to delete post');
        }
    };

    // Check if post is expired
    const isExpired = (bestBefore) => {
        return new Date(bestBefore) < new Date();
    };

    if (loading) return <div className="loading">Loading admin panel...</div>;

    return (
        <div className="admin-container">
            <h2>Admin Panel</h2>
            {/* ADMIN STATS */}
            <div className="admin-stats">
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>{stats.totalPosts}</h3>
                        <p>Total Food Posts</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats.totalVolunteers}</h3>
                        <p>Active Volunteers</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats.completedDeliveries}</h3>
                        <p>Completed Deliveries</p>
                    </div>
                    <div className="stat-card expired">
                        <h3>{stats.expiredPosts}</h3>
                        <p>Expired Posts</p>
                    </div>
                </div>
            </div>

            {/* MANUAL VOLUNTEER ASSIGNMENT */}
            <div className="admin-section">
                <h3>👥 Assign Volunteer to Food Post</h3>
                <div className="assign-volunteer-form">
                    <div className="form-group">
                        <label>Select Food Post - {requestedUnassignedPosts.length} available</label>
                        <select 
                            value={selectedPost} 
                            onChange={(e) => setSelectedPost(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Choose a food post...</option>
                            {requestedUnassignedPosts.map(post => (
                                <option key={post._id} value={post._id}>
                                    {post.title} - {post.location} (by {post.postedBy?.name || 'Unknown'})
                                </option>
                            ))}
                        </select>
                        {/* {requestedUnassignedPosts.length === 0 && (
                            <div className="no-posts-message">
                                <p>No unassigned requested posts available</p>
                                <button onClick={fetchData} className="btn btn-sm btn-outline-primary">
                                    🔄 Refresh Data
                                </button>
                            </div>
                        )} */}
                    </div>

                    <div className="form-group">
                        <label>Select Volunteer - {volunteers.length} available</label>
                        <select 
                            value={selectedVolunteer} 
                            onChange={(e) => setSelectedVolunteer(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Choose a volunteer...</option>
                            {volunteers.map(volunteer => (
                                <option key={volunteer._id} value={volunteer._id}>
                                    {volunteer.name} - {volunteer.location} ({volunteer.phone})
                                </option>
                            ))}
                        </select>
                        {/* {volunteers.length === 0 && (
                            <div className="no-volunteers-message">
                                <p>No volunteers registered yet</p>
                                <button onClick={fetchVolunteers} className="btn btn-sm btn-outline-primary">
                                    🔄 Refresh Volunteers
                                </button>
                            </div>
                        )} */}
                    </div>
                            
                    <button 
                        onClick={handleAssignVolunteer}
                        className="btn btn-primary assign-btn"
                        disabled={!selectedPost || !selectedVolunteer}
                    >
                        Assign Volunteer
                    </button>
                </div>
            </div>

            {/* ALL POSTS OVERVIEW */}
            <div className="admin-section">
                <h3>📋 All Food Posts Overview ({allPosts.length} total)</h3>
                <div className="posts-table-container">
                    {allPosts.length > 0 ? (
                        <div className="posts-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Food Item</th>
                                        <th>Donor</th>
                                        <th>Status</th>
                                        <th>Receiver</th>
                                        <th>Volunteer</th>
                                        <th>Location</th>
                                        <th>Best Before</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allPosts.map(post => (
                                        <tr key={post._id} className={isExpired(post.bestBefore) ? 'expired-row' : ''}>
                                            <td>
                                                <div className="food-info">
                                                    <strong>{post.title}</strong>
                                                    <br />
                                                    <small>{post.quantity}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="user-info">
                                                    {post.postedBy?.name || 'Unknown'}
                                                    <br />
                                                    <small>{post.postedBy?.phone || 'N/A'}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status ${post.status}`}>
                                                    {post.status}
                                                </span>
                                                {isExpired(post.bestBefore) && (
                                                    <span className="expired-badge">EXPIRED</span>
                                                )}
                                            </td>
                                            <td>
                                                {post.requestedBy ? (
                                                    <div className="user-info">
                                                        {post.requestedBy.name}
                                                        <br />
                                                        <small>{post.requestedBy.phone}</small>
                                                    </div>
                                                ) : (
                                                    <span className="not-assigned">-</span>
                                                )}
                                            </td>
                                            <td>
                                                {post.assignedVolunteer ? (
                                                    <div className="user-info">
                                                        {post.assignedVolunteer.name}
                                                        <br />
                                                        <small>{post.assignedVolunteer.phone}</small>
                                                    </div>
                                                ) : (
                                                    <span className="not-assigned">Not assigned</span>
                                                )}
                                            </td>
                                            <td>{post.location}</td>
                                            <td>
                                                <span className={isExpired(post.bestBefore) ? 'expired-date' : ''}>
                                                    {new Date(post.bestBefore).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    onClick={() => handleDeletePost(post._id, post.title)}
                                                    className="btn btn-danger btn-sm delete-btn"
                                                    title="Delete this post"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-posts">
                            <p>No food posts found in the system yet.</p>
                            <button 
                                onClick={fetchAllPosts}
                                className="btn btn-primary"
                            >
                                🔄 Refresh Posts
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* VOLUNTEERS LIST */}
            <div className="admin-section">
                <h3>👷 Registered Volunteers ({volunteers.length} total)</h3>
                <div className="volunteers-grid">
                    {volunteers.length > 0 ? (
                        volunteers.map(volunteer => (
                            <div key={volunteer._id} className="volunteer-card">
                                <h4>{volunteer.name}</h4>
                                <p><strong>Location:</strong> {volunteer.location}</p>
                                <p><strong>Phone:</strong> {volunteer.phone}</p>
                                <p><strong>Email:</strong> {volunteer.email}</p>
                                <div className="volunteer-stats">
                                    <span>Active Assignments: {allPosts.filter(p => p.assignedVolunteer?._id === volunteer._id && p.status !== 'delivered').length}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-volunteers">
                            <p>No volunteers registered yet.</p>
                            <button 
                                onClick={fetchVolunteers}
                                className="btn btn-primary"
                            >
                                🔄 Refresh Volunteers
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;