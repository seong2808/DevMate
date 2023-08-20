import { Router } from 'express';
import {
  getAllGroups,
  getGroup,
  postGroup,
  patchGroup,
  deleteGroup,
  joinReqGroup,
  getGroupJoinList,
  approveGroupJoinRequest,
  rejectGroupJoinRequest,
} from '../controllers/groupsControllers';
import { handleGroupVisit } from '../middlewares/group.handler';
import upload from '../middlewares/uploadFile.handler';
import { handleDtoValidate } from '../middlewares/validateDto.handler';

const router = Router();

router.get('/', handleGroupVisit, getAllGroups);

router.get('/:groupId', handleGroupVisit, getGroup);

router.post('/', upload.single('imageFile'), handleDtoValidate, postGroup);

router.patch('/:groupId', upload.single('imageFile'), patchGroup);

router.delete('/:groupId', deleteGroup);

router.post('/joinRequests/:groupId', joinReqGroup);

router.get('/joinRequests/:groupId', getGroupJoinList);

router.patch('/approveJoinRequest/:joinId', approveGroupJoinRequest);

router.patch('/rejectJoinRequest/:joinId', rejectGroupJoinRequest);

export default router;
