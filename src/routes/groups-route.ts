import { Router } from 'express';
import {
  getWishGroupList,
  getCreatedGroupList,
  joinGroupList,
  patchWishlist,
  deleteOneWishlist,
  patchEndGroup,
} from '../controllers/groups-controller';

import { handleGroupVisit } from '../middlewares/group.handler';
import upload from '../middlewares/uploadFile.handler';
import { handleDtoValidate } from '../middlewares/validateDto.handler';
import isLoggedIn from '../middlewares/login-required.handler';
import GroupController from '../controllers/groupsController';
import GroupService from '../services/groups-service';
import UserService from '../services/users-service';
import JoinService from '../services/join-service';

const router = Router();
const groupService = new GroupService();
const userService = new UserService();
const joinService = new JoinService();
const groupController = new GroupController(
  groupService,
  userService,
  joinService,
);

router.get('/', handleGroupVisit, groupController.getAllGroup);

router.get('/:groupId', handleGroupVisit, groupController.getGroup);

router.get('/main/hotGroup', handleGroupVisit, groupController.getHotGroup);

// 찜한
router.get('/myGroup/wishGroup', isLoggedIn, getWishGroupList);
// 생성한
router.get('/myGroup/createdGroup', isLoggedIn, getCreatedGroupList);
// 현재 진행
router.get(
  '/myGroup/ongoingGroup',
  isLoggedIn,
  groupController.getOngoingGroupList,
);
// 지원한
router.get('/myGroup/joinRequestGroup', isLoggedIn, joinGroupList);
// 그룹 참여 신청 리스트 ( 그룹 입장 )
router.get('/joinRequests/:groupId', groupController.getGroupJoinList);

router.post(
  '/',
  upload.single('imageFile'),
  handleDtoValidate,
  isLoggedIn,
  groupController.postCreateGroup,
);

router.patch('/endGroup/:groupId', isLoggedIn, patchEndGroup);

// 수정
router.patch(
  '/:groupId',
  upload.single('imageFile'),
  groupController.patchUpdateGroup,
);

// 삭제
router.delete('/:groupId', groupController.deleteGroup);

// 그룹 참여 요청
router.post('/joinRequests/:groupId', groupController.joinReqGroup);

router.patch(
  '/approveJoinRequest/:joinId',
  groupController.approveGroupJoinRequest,
);

router.patch(
  '/rejectJoinRequest/:joinId',
  groupController.rejectGroupJoinRequest,
);

router.patch('/subscribe/:groupId', isLoggedIn, patchWishlist);

router.patch('/unsubscribe/:groupId', isLoggedIn, deleteOneWishlist);

export default router;
