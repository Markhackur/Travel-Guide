const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    } 

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ✅ Handle both id and _id from JWT payload
    const user = await User.findById(decoded.id || decoded._id).lean();

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // ✅ Normalize user object for entire app
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    next(err);
  }
};

module.exports = authMiddleware;