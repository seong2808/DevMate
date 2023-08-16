import express from 'express';
import {
  getAllGroups,
  getGroup,
  postGroup,
  patchGroup,
  deleteGroup,
} from '../controllers/groups-controllers';
import handleGroupVisit from '../middlewares/handle-group-visit';

const router = express.Router();

router.get('/api/groups', handleGroupVisit, getAllGroups);
router.get('/api/groups/:groupId', handleGroupVisit, getGroup);
router.post('/api/groups', postGroup);
router.patch('/api/groups/:groupId', patchGroup);
router.delete('/api/groups/:groupId', deleteGroup);

export default router;
