import { Router } from 'express';
import {
  postGroup,
  patchGroup,
  deleteGroup,
  joinReqGroup,
  getGroupJoinList,
  approveGroupJoinRequest,
  rejectGroupJoinRequest,
  getWishGroupList,
  getCreatedGroupList,
  joinGroupList,
  getOngoingGroupList,
  patchWishlist,
  deleteOneWishlist,
  patchEndGroup,
} from '../controllers/groups-controller';

import { handleGroupVisit } from '../middlewares/group.handler';
import upload from '../middlewares/uploadFile.handler';
import { handleDtoValidate } from '../middlewares/validateDto.handler';
import isLoggedIn from '../middlewares/login-required.handler';
import GroupController from '../controllers/groupsController';
import GroupsService from '../services/groups-service';
import UsersService from '../services/users-service';

const router = Router();
const groupsService = new GroupsService();
const usersService = new UsersService();
const groupsController = new GroupController(groupsService, usersService);

router.get('/', handleGroupVisit, groupsController.getAllGroup);

router.get('/:groupId', handleGroupVisit, groupsController.getGroup);

router.get('/main/hotGroup', handleGroupVisit, groupsController.getHotGroup);

// 찜한
router.get('/myGroup/wishGroup', isLoggedIn, getWishGroupList);
// 생성한
router.get('/myGroup/createdGroup', isLoggedIn, getCreatedGroupList);
// 현재 진행
router.get('/myGroup/ongoingGroup', isLoggedIn, getOngoingGroupList);
// 지원한
router.get('/myGroup/joinRequestGroup', isLoggedIn, joinGroupList);

router.get('/joinRequests/:groupId', getGroupJoinList);

router.post(
  '/',
  upload.single('imageFile'),
  handleDtoValidate,
  isLoggedIn,
  groupsController.postCreateGroup,
);

router.patch('/endGroup/:groupId', isLoggedIn, patchEndGroup);

router.patch('/:groupId', upload.single('imageFile'), patchGroup);

router.delete('/:groupId', deleteGroup);

router.post('/joinRequests/:groupId', joinReqGroup);

router.patch('/approveJoinRequest/:joinId', approveGroupJoinRequest);

router.patch('/rejectJoinRequest/:joinId', rejectGroupJoinRequest);

router.patch('/subscribe/:groupId', isLoggedIn, patchWishlist);

router.patch('/unsubscribe/:groupId', isLoggedIn, deleteOneWishlist);

export default router;
