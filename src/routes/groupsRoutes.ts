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
  getHotGroups,
  ongoingGroupList,
  wishlistGroupList,
  createdGroupList,
  joinGroupList,
} from '../controllers/groupsControllers';
import { handleGroupVisit } from '../middlewares/group.handler';
import upload from '../middlewares/uploadFile.handler';
import { handleDtoValidate } from '../middlewares/validateDto.handler';

const router = Router();

router.get('/', handleGroupVisit, getAllGroups);

router.get('/hotGroup', handleGroupVisit, getHotGroups);

router.get('/:groupId', handleGroupVisit, getGroup);

router.post('/', upload.single('imageFile'), handleDtoValidate, postGroup);

router.patch('/:groupId', upload.single('imageFile'), patchGroup);

router.delete('/:groupId', deleteGroup);

router.post('/joinRequests/:groupId', joinReqGroup);

router.get('/joinRequests/:groupId', getGroupJoinList);

router.patch('/approveJoinRequest/:joinId', approveGroupJoinRequest);

router.patch('/rejectJoinRequest/:joinId', rejectGroupJoinRequest);

// 현재 진행
router.post('/ongoing/:groupId', ongoingGroupList);
//찜한
router.post('/wishlist/:groupId', wishlistGroupList);
//생성한
router.post('/created/:groupId', createdGroupList);
//지원한
router.post('/join/:groupId', joinGroupList);

export default router;
