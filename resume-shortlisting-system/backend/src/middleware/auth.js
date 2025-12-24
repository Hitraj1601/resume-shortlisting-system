import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { setCache, getCache } from '../config/redis.js';

// Hardcoded users for authentication
const HARDCODED_USERS = {
  'hr@company.com': {
    id: 'hr001',
    name: 'HR Manager',
    email: 'hr@company.com',
    password: 'hr123456',
    role: 'hr',
    company: 'Tech Corp'
  },
  'candidate@email.com': {
    id: 'candidate001',
    name: 'John Doe',
    email: 'candidate@email.com',
    password: 'candidate123',
    role: 'candidate',
    experience: 3,
    skills: ['JavaScript', 'React', 'Node.js']
  },
  'admin@company.com': {
    id: 'admin001',
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin'
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Find user (check hardcoded first, then database)
    let user = HARDCODED_USERS[decoded.email];
    
    if (!user) {
      user = await User.findById(decoded.id).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'User role not authorized' 
      });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          // Token expired, continue without user
          return next();
        }

        const cachedUser = await getCache(`user:${decoded.id}`);
        let user;

        if (cachedUser) {
          user = cachedUser;
        } else {
          user = await User.findById(decoded.id).select('-password');
          
          if (user && user.isActive) {
            await setCache(`user:${decoded.id}`, user, 900);
          }
        }

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, continue without user
      }
    }

    next();
  } catch (error) {
    // Continue without user on error
    next();
  }
};

export const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export const generateToken = (id, email) => {
  return jwt.sign(
    { id, email },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '30d' }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
