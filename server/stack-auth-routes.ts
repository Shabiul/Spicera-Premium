import { Request, Response } from 'express';
import { storage } from './storage';

// Get user profile by Stack Auth user ID
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Try to get user profile from our database
    const profile = await storage.getUserProfile(userId);
    
    if (profile) {
      res.json(profile);
    } else {
      // Return default profile if not found
      res.json({
        role: 'customer',
        phone: null,
        address: null
      });
    }
  } catch (error) {
    console.error('Failed to get user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role, phone, address } = req.body;
    
    // Update or create user profile in our database
    const updatedProfile = await storage.updateUserProfile(userId, {
      role,
      phone,
      address
    });
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Failed to update user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};