const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No valid token provided.' });
        }

        const token = authHeader.substring(7); 
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;