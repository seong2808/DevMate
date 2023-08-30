"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const group_handler_1 = require("../middlewares/group.handler");
const uploadFile_handler_1 = __importDefault(require("../middlewares/uploadFile.handler"));
const validateDto_handler_1 = require("../middlewares/validateDto.handler");
const login_required_handler_1 = __importDefault(require("../middlewares/login-required.handler"));
const groups_controller_1 = __importDefault(require("../controllers/groups-controller"));
const groups_service_1 = __importDefault(require("../services/groups-service"));
const users_service_1 = __importDefault(require("../services/users-service"));
const join_service_1 = __importDefault(require("../services/join-service"));
const notification_service_1 = __importDefault(require("../services/notification-service"));
const notification_controller_1 = __importDefault(require("../controllers/notification-controller"));
const router = (0, express_1.Router)();
const groupService = new groups_service_1.default();
const userService = new users_service_1.default();
const joinService = new join_service_1.default();
const notificationService = new notification_service_1.default();
const groupController = new groups_controller_1.default(groupService, userService, joinService, notificationService);
const notificationController = new notification_controller_1.default(notificationService, userService);
// 그룹 전체 조회 필터링 및 페이지네이션 포함
router.get('/', group_handler_1.handleGroupVisit, groupController.getAllGroup);
// 그룹 상세 정보 조회
router.get('/:groupId', group_handler_1.handleGroupVisit, groupController.getGroup);
// 상위 4개 그룹 조회
router.get('/main/hotGroup', group_handler_1.handleGroupVisit, groupController.getHotGroup);
// 알림 조회
router.get('/notification/getAllUser', login_required_handler_1.default, notificationController.getAllnotification);
// 알림 삭제
router.delete('/notification/delete/:notificationId', login_required_handler_1.default, notificationController.deleteNotification);
// 알림 전체 삭제
router.delete('/notification/deleteAll', login_required_handler_1.default, notificationController.deleteAllNotification);
// 관심 그룹
router.get('/myGroup/wishGroup/:type', login_required_handler_1.default, groupController.getWishGroupList);
// 생성한
router.get('/myGroup/createdGroup', login_required_handler_1.default, groupController.getCreatedGroupList);
// 현재 진행
router.get('/myGroup/ongoingGroup', login_required_handler_1.default, groupController.getOngoingGroupList);
// 지원한
router.get('/myGroup/joinRequestGroup/:type', login_required_handler_1.default, groupController.getJoinGroupList);
// 그룹 참여 신청 리스트 ( 그룹 입장 )
router.get('/joinRequests/:groupId', groupController.getGroupJoinList);
// 그룹 생성
router.post('/', uploadFile_handler_1.default.single('imageFile'), validateDto_handler_1.handleDtoValidate, login_required_handler_1.default, groupController.postCreateGroup);
// 수정
router.patch('/updateGroup/:groupId', uploadFile_handler_1.default.single('imageFile'), groupController.patchUpdateGroup);
// 삭제
router.delete('/:groupId', login_required_handler_1.default, groupController.deleteGroup);
// 그룹 참여 요청
router.post('/joinRequests/:groupId', groupController.joinReqGroup);
// 그룹 참여 요청 승인
router.patch('/approveJoinRequest/:joinId', login_required_handler_1.default, groupController.approveGroupJoinRequest);
// 그룹 참여 요청 거절
router.patch('/rejectJoinRequest/:joinId', login_required_handler_1.default, groupController.rejectGroupJoinRequest);
// 관심 그룹 등록 및 해제
router.patch('/subscribe/:groupId/:wishState', login_required_handler_1.default, groupController.patchWishlist);
// 그룹 상태 변경
router.patch('/changeStatus/:groupId', login_required_handler_1.default, groupController.patchChangeStatus);
// 지원 리스트 전체 거절
router.patch('/deleteAllJoinReqList/:groupId', login_required_handler_1.default, groupController.deleteAllJoinReqList);
// 지원 전체 취소
router.patch('/join/cancelAllReq', login_required_handler_1.default, groupController.cancelAllJoinReq);
// 관심 그룹 전체 삭제
router.patch('/WishList/deleteAll', login_required_handler_1.default, groupController.deleteAllWishList);
// 지원 취소
router.patch('/join/cancelReq/:groupId', login_required_handler_1.default, groupController.cancelJoinReq);
// 그룹 탈퇴
router.patch('/exitUserInGroup/:groupId', login_required_handler_1.default, groupController.exitGroup);
exports.default = router;
