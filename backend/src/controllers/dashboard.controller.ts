import { Request, Response } from 'express';
import { buildDashboard } from '../services/dashboard.service.js';
import { UnauthenticatedError } from '../errors/index.js';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthenticatedError('User not authenticated');
    }

    const dashboard = await buildDashboard(userId);

    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};
