import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// JWKS client for Stack Auth
const client = jwksClient({
  jwksUri: `https://api.stack-auth.com/api/v1/projects/${process.env.VITE_STACK_PROJECT_ID}/jwks`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

interface StackAuthUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: StackAuthUser;
    }
  }
}

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const authenticateStackToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify the JWT token using Stack Auth's JWKS
    const decoded = await new Promise<any>((resolve, reject) => {
      jwt.verify(token, getKey, {
        audience: process.env.VITE_STACK_PROJECT_ID,
        issuer: 'https://api.stack-auth.com',
        algorithms: ['ES256']
      }, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    // Fetch additional user profile data from our database
    const userProfile = await fetchUserProfile(decoded.sub);
    
    req.user = {
      id: decoded.sub,
      email: decoded.email || '',
      name: decoded.name || decoded.email || '',
      role: userProfile?.role || 'customer',
      phone: userProfile?.phone,
      address: userProfile?.address
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalStackAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = await new Promise<any>((resolve, reject) => {
        jwt.verify(token, getKey, {
          audience: process.env.VITE_STACK_PROJECT_ID,
          issuer: 'https://api.stack-auth.com',
          algorithms: ['ES256']
        }, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });

      const userProfile = await fetchUserProfile(decoded.sub);
      
      req.user = {
        id: decoded.sub,
        email: decoded.email || '',
        name: decoded.name || decoded.email || '',
        role: userProfile?.role || 'customer',
        phone: userProfile?.phone,
        address: userProfile?.address
      };
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

export const requireCustomer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'customer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Customer access required' });
  }

  next();
};

// Helper function to fetch user profile from database
async function fetchUserProfile(userId: string) {
  try {
    // This would typically query your database
    // For now, return default values
    return {
      role: 'customer' as const,
      phone: undefined,
      address: undefined
    };
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}