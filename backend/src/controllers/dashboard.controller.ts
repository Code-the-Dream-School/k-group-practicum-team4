import { Request, Response } from 'express';
import { buildDashboard, buildActivityLog } from '../services/dashboard.service.js';
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

export const getDashboardActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthenticatedError('User not authenticated');
    }

    const limitParam = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
    const limit = Number.isFinite(limitParam) ? limitParam : undefined;
    const activity = await buildActivityLog(userId, { limit });

    res.json(activity);
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ message: 'Failed to load dashboard activity' });
  }
};
