// backend/middleware/auth.js
const { verifyToken } = require('../config/auth');

const authMiddleware = (req, res, next) => {
    console.log('Headers:', req.headers);
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded);
    if (!decoded) {
        return res.status(401).json({ message: 'Token tidak valid' });
    }
    console.log('Decoded token:', decoded); // Add this for debugging
    req.user = decoded;
    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Akses ditolak' });
        }
        next();
    };
};

module.exports = { authMiddleware, requireRole };