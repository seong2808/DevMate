import express from 'express';
import { postGroup } from '../controllers/groups-controllers';

const router = express.Router();

router.post('/api/groups', postGroup);

export default router;
