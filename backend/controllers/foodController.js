const { get } = require('http');
const FoodPost = require('../models/FoodPost');
const User = require('../models/user');

// Create food post (Donors only)
exports.createFoodPost = async (req, res) => {
    const {title, description, quantity, location, bestBefore, donorCannotDeliver} = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const postedBy = req.user._id;
    
    try {
        // Check if user is a donor
        if (req.user.role !== 'donor') {
            return res.status(403).json({ success: false, message: "Only donors can create food posts" });
        }

        const newFoodPost = new FoodPost({
            title,
            description,
            quantity,
            imageUrl,
            location,
            bestBefore,
            postedBy: postedBy,
            donorCannotDeliver: donorCannotDeliver === 'true'
        });
        
        await newFoodPost.save();
        res.status(201).json({ success: true, message: "Food post created successfully", foodPost: newFoodPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add this function to your existing foodController.js
exports.getAllPostsForAdmin = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Only admins can access this" });
        }

        const foodPosts = await FoodPost.find({})
            .populate('postedBy', 'name location phone')
            .populate('requestedBy', 'name location phone')
            .populate('assignedVolunteer', 'name location phone')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, foodPosts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all available food posts
exports.getAllFoodPosts = async (req, res) => {
    try {
        const foodPosts = await FoodPost.find({status: 'available'})
            .populate('postedBy', 'name location phone')
            .populate('requestedBy', 'name location phone')
            .populate('assignedVolunteer', 'name location phone');
        res.status(200).json({ success: true, foodPosts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Request food post (Receivers only)
exports.requestFoodPost = async (req, res) => {
    const postId = req.params.id;

    try {
        // Check if user is a receiver
        if (req.user.role !== 'receiver') {
            return res.status(403).json({ success: false, message: "Only receivers can request food" });
        }

        const post = await FoodPost.findById(postId);
        if(!post || post.status !== 'available') {
            return res.status(404).json({ success: false, message: "Food post not found or not available" });
        }

        post.status = 'requested';
        post.requestedBy = req.user._id;
        post.updatedAt = new Date();
        
        // If donor cannot deliver, auto-assign volunteer
        if (post.donorCannotDeliver) {
            const nearbyVolunteer = await findNearbyVolunteer(post.location);
            if (nearbyVolunteer) {
                post.assignedVolunteer = nearbyVolunteer._id;
            }
        }
        
        await post.save();
        res.status(200).json({ success: true, message: "Food post requested successfully", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark as picked (Volunteers only)
exports.markPicked = async (req, res) => {
    const postId = req.params.id;

    try {
        // Check if user is a volunteer
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ success: false, message: "Only volunteers can mark as picked" });
        }

        const post = await FoodPost.findById(postId);
        if (!post || post.status !== 'requested') {
            return res.status(404).json({ success: false, message: "Food post not found or not requested" });
        }

        post.status = 'picked';
        post.assignedVolunteer = req.user._id;
        post.pickupDate = new Date();
        post.updatedAt = new Date();
        
        await post.save();
        res.status(200).json({ success: true, message: "Food post marked as picked", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark as delivered (Volunteers only)
exports.markDelivered = async (req, res) => {
    const postId = req.params.id;

    try {
        // Check if user is a volunteer
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ success: false, message: "Only volunteers can mark as delivered" });
        }

        const post = await FoodPost.findById(postId);
        if (!post || post.status !== 'picked') {
            return res.status(404).json({ success: false, message: "Food post not found or not picked" });
        }

        post.status = 'delivered';
        post.deliveryDate = new Date();
        post.updatedAt = new Date();
        
        await post.save();
        res.status(200).json({ success: true, message: "Food post marked as delivered", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get posts by logged-in user (role-based)
exports.getMyPosts = async (req, res) => {
    try {
        let posts;
        const userId = req.user._id;
        
        if (req.user.role === 'donor') {
            // Donors see their donated posts
            posts = await FoodPost.find({ postedBy: userId })
                .populate('requestedBy', 'name location phone')
                .populate('assignedVolunteer', 'name location phone')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'receiver') {
            // Receivers see their requested posts
            posts = await FoodPost.find({ requestedBy: userId })
                .populate('postedBy', 'name location phone')
                .populate('assignedVolunteer', 'name location phone')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'volunteer') {
            // Volunteers see posts assigned to them
            posts = await FoodPost.find({ assignedVolunteer: userId })
                .populate('postedBy', 'name location phone')
                .populate('requestedBy', 'name location phone')
                .sort({ createdAt: -1 });
        } else {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        
        res.status(200).json({ success: true, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get volunteer dashboard stats
exports.getVolunteerStats = async (req, res) => {
    try {
        if (req.user.role !== 'volunteer') {
            return res.status(403).json({ success: false, message: "Only volunteers can access this" });
        }

        const pickedCount = await FoodPost.countDocuments({ 
            assignedVolunteer: req.user._id, 
            status: { $in: ['picked', 'delivered'] }
        });
        
        const deliveredCount = await FoodPost.countDocuments({ 
            assignedVolunteer: req.user._id, 
            status: 'delivered' 
        });

        res.status(200).json({ 
            success: true, 
            stats: { pickedCount, deliveredCount } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin assign volunteer
exports.assignVolunteer = async (req, res) => {
    const { postId, volunteerId } = req.body;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Only admins can assign volunteers" });
        }

        const post = await FoodPost.findById(postId);
        const volunteer = await User.findById(volunteerId);

        if (!post || !volunteer) {
            return res.status(404).json({ success: false, message: "Post or volunteer not found" });
        }

        if (volunteer.role !== 'volunteer') {
            return res.status(400).json({ success: false, message: "User is not a volunteer" });
        }

        post.assignedVolunteer = volunteerId;
        post.updatedAt = new Date();
        await post.save();

        res.status(200).json({ success: true, message: "Volunteer assigned successfully", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to find nearby volunteer
const findNearbyVolunteer = async (location) => {
    try {
        const volunteer = await User.findOne({ 
            role: 'volunteer',
            location: { $regex: location, $options: 'i' }
        });
        return volunteer;
    } catch (error) {
        console.error(error);
        return null;
    }
};
// Add this function to your existing foodController.js

exports.deletePost = async (req, res) => {
    const postId = req.params.id;

    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Only admins can delete posts" });
        }

        const post = await FoodPost.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Food post not found" });
        }

        // Delete the post
        await FoodPost.findByIdAndDelete(postId);
        
        res.status(200).json({ 
            success: true, 
            message: "Food post deleted successfully",
            deletedPost: {
                id: post._id,
                title: post.title,
                status: post.status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    createFoodPost: exports.createFoodPost,
    getAllFoodPosts: exports.getAllFoodPosts,
    requestFoodPost: exports.requestFoodPost,
    markPicked: exports.markPicked,
    markDelivered: exports.markDelivered,
    getMyPosts: exports.getMyPosts,
    getVolunteerStats: exports.getVolunteerStats,
    assignVolunteer: exports.assignVolunteer,
    getAllPostsForAdmin: exports.getAllPostsForAdmin,
    deletePost: exports.deletePost,
    updatePostStatus: exports.updatePostStatus
};