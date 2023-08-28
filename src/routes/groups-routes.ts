import { Router } from 'express';
import { handleGroupVisit } from '../middlewares/group.handler';
import upload from '../middlewares/uploadFile.handler';
import { handleDtoValidate } from '../middlewares/validateDto.handler';
import isLoggedIn from '../middlewares/login-required.handler';
import GroupController from '../controllers/groups-controller';
import GroupService from '../services/groups-service';
import UserService from '../services/users-service';
import JoinService from '../services/join-service';
import NotificationService from '../services/notification-service';
import NotificationController from '../controllers/notification-controller';

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
const notificationController = new NotificationController(
  notificationService,
  userService,
);

// 그룹 전체 조회 필터링 및 페이지네이션 포함
router.get('/', handleGroupVisit, groupController.getAllGroup);

// 그룹 상세 정보 조회
router.get('/:groupId', handleGroupVisit, groupController.getGroup);

// 상위 4개 그룹 조회
router.get('/main/hotGroup', handleGroupVisit, groupController.getHotGroup);

// 알림 조회
router.get(
  '/notification/getAllUser',
  isLoggedIn,
  notificationController.getAllnotification,
);

// 알림 삭제
router.delete(
  '/notification/delete/:notificationId',
  isLoggedIn,
  notificationController.deleteNotification,
);

// 알림 전체 삭제
router.delete(
  '/notification/deleteAll',
  isLoggedIn,
  notificationController.deleteAllNotification,
);

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

// 그룹 생성
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

// 그룹 참여 요청 승인
router.patch(
  '/approveJoinRequest/:joinId',
  isLoggedIn,
  groupController.approveGroupJoinRequest,
);

// 그룹 참여 요청 거절
router.patch(
  '/rejectJoinRequest/:joinId',
  isLoggedIn,
  groupController.rejectGroupJoinRequest,
);

// 관심 그룹 등록 및 해제
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

// 지원 리스트 전체 거절
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

// 그룹 탈퇴
router.patch(
  '/exitUserInGroup/:groupId',
  isLoggedIn,
  groupController.exitGroup,
);

// 지원 전체 취소
router.patch('/cancelAllJoinReq', isLoggedIn, groupController.cancelAllJoinReq);

export default router;
