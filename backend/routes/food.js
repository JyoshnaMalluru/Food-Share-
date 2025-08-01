const express = require("express");
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require("../middleware/authMiddleware");
const { 
    createFoodPost, 
    getAllFoodPosts, 
    requestFoodPost, 
    markPicked, 
    markDelivered,
    getMyPosts,
    getVolunteerStats,
    assignVolunteer,
    getAllPostsForAdmin,
    getAllFoodPostsForAdmin,
    deletePost,                
} = require("../controllers/foodController");

// Public routes
router.get("/all", getAllFoodPosts);

// Protected routes
router.post('/create', auth, upload.single('image'), createFoodPost);
router.get('/mine', auth, getMyPosts);
router.get('/admin/all', auth, getAllPostsForAdmin);
router.patch('/request/:id', auth, requestFoodPost);
router.patch('/picked/:id', auth, markPicked);
router.patch('/delivered/:id', auth, markDelivered);
router.get('/volunteer-stats', auth, getVolunteerStats);
router.post('/assign-volunteer', auth, assignVolunteer);
router.delete('/admin/delete/:id', auth, deletePost);               
module.exports = router;