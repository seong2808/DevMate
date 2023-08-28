import { Router } from 'express';
import { handleGroupVisit } from '../middlewares/group.handler';
import upload from '../middlewares/uploadFile.handler';
import { handleDtoValidate } from '../middlewares/validateDto.handler';
import isLoggedIn from '../middlewares/login-required.handler';
import GroupController from '../controllers/groupsController';
import GroupService from '../services/groups-service';
import UserService from '../services/users-service';
import JoinService from '../services/join-service';
import NotificationService from '../services/notification-service';

const router = Router();
const groupService = new GroupService();
const userService = new UserService();
const joinService = new JoinService();
const notificationService = new NotificationService();
const groupController = new GroupController(
  groupService,
  userService,
  joinService,
  notificationService,
);

router.get('/', handleGroupVisit, groupController.getAllGroup);

router.get('/:groupId', handleGroupVisit, groupController.getGroup);

router.get('/main/hotGroup', handleGroupVisit, groupController.getHotGroup);

// 관심 그룹
router.get(
  '/myGroup/wishGroup/:type',
  isLoggedIn,
  groupController.getWishGroupList,
);
// 생성한
router.get(
  '/myGroup/createdGroup',
  isLoggedIn,
  groupController.getCreatedGroupList,
);
// 현재 진행
router.get(
  '/myGroup/ongoingGroup',
  isLoggedIn,
  groupController.getOngoingGroupList,
);
// 지원한
router.get(
  '/myGroup/joinRequestGroup/:type',
  isLoggedIn,
  groupController.getJoinGroupList,
);
// 그룹 참여 신청 리스트 ( 그룹 입장 )
router.get('/joinRequests/:groupId', groupController.getGroupJoinList);

router.post(
  '/',
  upload.single('imageFile'),
  handleDtoValidate,
  isLoggedIn,
  groupController.postCreateGroup,
);

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

router.patch(
  '/subscribe/:groupId/:wishState',
  isLoggedIn,
  groupController.patchWishlist,
);

// 그룹 상태 변경
router.patch(
  '/changeStatus/:groupId',
  isLoggedIn,
  groupController.patchChangeStatus,
);

router.patch(
  '/deleteAllJoinReqList/:groupId',
  isLoggedIn,
  groupController.deleteAllJoinReqList,
);

// 지원 취소
router.patch(
  '/cancelJoinReq/:groupId',
  isLoggedIn,
  groupController.cancelJoinReq,
);

// 지원 전체 취소
router.patch('/cancelAllJoinReq', isLoggedIn, groupController.cancelAllJoinReq);

export default router;
