"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groupsControllers_1 = require("../controllers/groupsControllers");
const group_handler_1 = require("../middlewares/group.handler");
const uploadFile_handler_1 = __importDefault(require("../middlewares/uploadFile.handler"));
const validateDto_handler_1 = require("../middlewares/validateDto.handler");
const login_required_handler_1 = __importDefault(require("../middlewares/login-required.handler"));
const router = (0, express_1.Router)();
router.get('/', group_handler_1.handleGroupVisit, groupsControllers_1.getAllGroups);
router.get('/:groupId', group_handler_1.handleGroupVisit, groupsControllers_1.getGroup);
router.get('/main/hotGroup', group_handler_1.handleGroupVisit, groupsControllers_1.getHotGroups);
// 찜한
router.get('/myGroup/wishGroup', login_required_handler_1.default, groupsControllers_1.getWishGroupList);
// 생성한
router.get('/myGroup/createdGroup', login_required_handler_1.default, groupsControllers_1.getCreatedGroupList);
// 현재 진행
router.get('/myGroup/ongoingGroup', login_required_handler_1.default, groupsControllers_1.getOngoingGroupList);
// 지원한
router.get('/myGroup/joinRequestGroup', login_required_handler_1.default, groupsControllers_1.joinGroupList);
router.get('/joinRequests/:groupId', groupsControllers_1.getGroupJoinList);
router.post('/', uploadFile_handler_1.default.single('imageFile'), validateDto_handler_1.handleDtoValidate, login_required_handler_1.default, groupsControllers_1.postGroup);
router.patch('/endGroup/:groupId', login_required_handler_1.default, groupsControllers_1.patchEndGroup);
router.patch('/:groupId', uploadFile_handler_1.default.single('imageFile'), groupsControllers_1.patchGroup);
router.delete('/:groupId', groupsControllers_1.deleteGroup);
router.post('/joinRequests/:groupId', groupsControllers_1.joinReqGroup);
router.patch('/approveJoinRequest/:joinId', groupsControllers_1.approveGroupJoinRequest);
router.patch('/rejectJoinRequest/:joinId', groupsControllers_1.rejectGroupJoinRequest);
router.patch('/subscribe/:groupId', login_required_handler_1.default, groupsControllers_1.patchWishlist);
router.patch('/unsubscribe/:groupId', login_required_handler_1.default, groupsControllers_1.deleteOneWishlist);
exports.default = router;
