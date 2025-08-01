import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/MyPosts.css';

const MyPosts = () => {
    const { backendUrl, authToken } = useContext(AppContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authToken) {
            toast.error('Please login to view your posts');
            navigate('/login');
            return;
        }
        fetchMyPosts();
    }, [authToken, navigate]);

    const fetchMyPosts = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${backendUrl}/api/foodposts/mine`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data && res.data.success) {
                setPosts(res.data.posts);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch your posts');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPicked = async (postId) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(`${backendUrl}/api/foodposts/picked/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data && res.data.success) {
                toast.success(res.data.message);
                fetchMyPosts(); // Refresh the list
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Only volunteer can mark as picked');
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="my-posts-container">
            <h2>My Food Posts</h2>
            <div className="posts-grid">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post._id} className="post-card">
                            {post.imageUrl && (
                                <img src={`${backendUrl}${post.imageUrl}`} alt={post.title} className="post-image" />
                            )}
                            <div className="post-details">
                                <h3>{post.title}</h3>
                                <p><strong>Description:</strong> {post.description}</p>
                                <p><strong>Quantity:</strong> {post.quantity}</p>
                                <p><strong>Location:</strong> {post.location}</p>
                                <p><strong>Best Before:</strong> {new Date(post.bestBefore).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> <span className={`status ${post.status}`}>{post.status}</span></p>
                                <p><strong>Created:</strong> {new Date(post.createdAt).toLocaleDateString()}</p>
                                
                                {post.status === 'requested' && (
                                    <button 
                                        onClick={() => handleMarkPicked(post._id)} 
                                        className="mark-picked-btn"
                                    >
                                        Mark as Picked
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-posts">
                        <p>You haven't posted any food yet.</p>
                        <button onClick={() => navigate('/donate')} className="donate-btn">
                            Donate Food
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPosts;