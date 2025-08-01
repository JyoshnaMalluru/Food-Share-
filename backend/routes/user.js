const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {registerUser, loginUser, getVolunteers} = require("../controllers/authController");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/volunteers", auth, getVolunteers); 
module.exports = router;