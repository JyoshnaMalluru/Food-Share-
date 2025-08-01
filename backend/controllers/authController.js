const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
require('dotenv').config();

exports.registerUser = async(req,res) => {
    const { name, email, password, role, location, phone } = req.body;

    try {
        if (!name || !email || !password || !role || !location || !phone) {
            return res.json({ success: false, message: 'Missing Details' })
        }
        
        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        } 
        
        // validating phone number
        if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
            return res.json({ success: false, message: "Please enter a valid phone number" })
        }
        
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            name,
            email,
            password: hashedPassword,
            role,
            location,
            phone
        };
        
        const newUser = new User(userData);
        const user = await newUser.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        // Return user data without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            location: user.location,
            phone: user.phone
        };

        return res.json({ success: true, token, user: userResponse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message});
    }
};

// Login user
exports.loginUser = async(req, res) => {
    const { email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email, role });
        if (!userExists) {
            return res.status(400).json({success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, userExists.password);
        if (!isMatch) {
            return res.status(400).json({success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: userExists._id, role: userExists.role}, process.env.JWT_SECRET);
        
        // Return user data without password
        const userResponse = {
            _id: userExists._id,
            name: userExists.name,
            email: userExists.email,
            role: userExists.role,
            location: userExists.location,
            phone: userExists.phone
        };

        return res.json({ success: true, token, user: userResponse});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "something went wrong"});
    }
};

exports.getVolunteers = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Only admins can access this" });
        }

        const volunteers = await User.find({ role: 'volunteer' }).select('name location phone email');
        res.status(200).json({ success: true, volunteers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};