import express from 'express';
import {
  getAllGroups,
  getGroup,
  postGroup,
  patchGroup,
  deleteGroup,
} from '../controllers/groups-controllers';
import handleGroupVisit from '../middlewares/group-visit-handler';
import upload from '../middlewares/upload-file-handler';

const router = express.Router();

router.get('/api/groups', handleGroupVisit, getAllGroups);

router.get('/api/groups/:groupId', handleGroupVisit, getGroup);

router.post('/api/groups', upload.single('imageFile'), postGroup);

router.patch('/api/groups/:groupId', upload.single('imageFile'), patchGroup);

router.delete('/api/groups/:groupId', deleteGroup);

export default router;
