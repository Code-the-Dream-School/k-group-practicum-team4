import { Router } from 'express';
import { getDashboardActivity, getDashboardData } from '../controllers/dashboard.controller';

const router = Router();

router.get('/', getDashboardData);
router.get('/activity', getDashboardActivity);

export default router;
