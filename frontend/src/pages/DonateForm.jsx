import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import '../styles/DonateForm.css';
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

const DonateForm = () => {
    const { backendUrl, authToken } = useContext(AppContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        quantity: "",
        image: null,
        location: "",
        bestBefore: "",
        donorCannotDeliver: true
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const userData = storedUser ? JSON.parse(storedUser) : null;
        
        if (!userData) {
            toast.error("Please log in to donate food.");
            navigate('/login');
        } else if (userData.role !== 'donor') {
            toast.error("Only donors can access this page.");
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleImage = (e) => {
        setFormData((prev) => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        if (!token) {
            toast.error("Unauthorized: No token found.");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('quantity', formData.quantity);
        formDataToSend.append('location', formData.location);
        formDataToSend.append('bestBefore', formData.bestBefore);
        formDataToSend.append('donorCannotDeliver', formData.donorCannotDeliver);
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        try {
            const res = await axios.post(`${backendUrl}/api/foodposts/create`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                }
            });
            
            if (res.data && res.data.success) {
                toast.success(res.data.message);
                navigate('/donor-dashboard');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to post food');
        }
    };

    return (
        <div className="donate-form-container">
            <h2 className="donate-form-title">Donate Food</h2>
            <form className="donate-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Food Name</label>
                    <input 
                        type="text" 
                        name="title" 
                        placeholder="E.g. Rice, Bread" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        name="description" 
                        placeholder="Describe the food item" 
                        value={formData.description} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>Quantity</label>
                    <input 
                        type="text" 
                        name="quantity" 
                        placeholder="e.g., 5 plates, 2kg" 
                        value={formData.quantity} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>Pickup Location</label>
                    <input 
                        type="text" 
                        name="location" 
                        placeholder="Your address for pickup" 
                        value={formData.location} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>Best Before Date</label>
                    <input 
                        type="date" 
                        name="bestBefore" 
                        value={formData.bestBefore} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>Upload Image</label>
                    <input 
                        type="file" 
                        onChange={handleImage} 
                        accept="image/*" 
                    />
                </div>
                
                {/* <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox" 
                            name="donorCannotDeliver" 
                            checked={formData.donorCannotDeliver}
                            onChange={handleChange} 
                        />
                        <span>I cannot deliver this food myself (Volunteer needed)</span>
                    </label>
                </div> */}
                
                <button type="submit" className="submit-btn">
                    Post Food Donation
                </button>
            </form>
        </div>
    );
};

export default DonateForm;