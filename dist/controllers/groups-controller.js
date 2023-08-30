"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_handler_1 = require("../middlewares/error.handler");
const mongoose_1 = __importDefault(require("mongoose"));
class GroupController {
    constructor(groupService, userService, joinService, notificationService) {
        // 전체 그룹 조회
        this.getAllGroup = async (req, res, next) => {
            const page = Number(req.query.page);
            const perPage = Number(req.query.perPage) || 8;
            const type = req.query.type?.toString();
            const location = req.query.location?.toString();
            const position = req.query.position?.toString();
            const skill = req.query.skills?.toString();
            const newPosition = position?.split(',');
            const newSkill = skill?.split(',');
            const sortByTime = req.query.sortByTime === 'false' ? false : true || true;
            try {
                const getGroup = await this.groupService.findAllGroup(page, perPage, type, location, newPosition, newSkill, sortByTime);
                if (getGroup.groups === null)
                    return next(new error_handler_1.HttpError('NOT_FOUND_GROUP', 404));
                res.json({ data: getGroup, error: null });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // ViewCount 상위 4개 그룹 조회
        this.getHotGroup = async (req, res, next) => {
            try {
                const getGroup = await this.groupService.findHotGroup();
                if (getGroup === null)
                    return next(new error_handler_1.HttpError('NOT_FOUND_GROUP', 404));
                res.json({ data: getGroup, error: null });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        //  그룹 상세 조회(조회 수 추가)
        this.getGroup = async (req, res, next) => {
            const { groupId } = req.params;
            try {
                const getGroup = await this.groupService.findOneGroup(groupId);
                if (getGroup === null)
                    return next(new error_handler_1.HttpError('GROUP_NOT_FOUND', 404));
                res.json({ data: getGroup, error: null });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 그룹 생성
        this.postCreateGroup = async (req, res, next) => {
            const createGruopDto = req.body;
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const user = await this.userService.getMyInfo(userId);
                if (!user) {
                    return next(new error_handler_1.HttpError('USER_NOT_FOUND', 404));
                }
                const userCreatedGroup = user.createdGroup;
                if (userCreatedGroup || mongoose_1.default.isValidObjectId(userCreatedGroup))
                    return res.status(400).json({ data: null, error: 'GROUP_EXISTS' });
                const groupData = {
                    ...createGruopDto,
                    position: JSON.parse(req.body.position),
                    skills: JSON.parse(req.body.skills),
                    author: userId,
                    currentMembers: [userId],
                    imageUrl: req.file ? req.file.path : '',
                };
                await this.groupService.createGroup(userId, groupData);
                res.status(204).json();
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 그룹 수정
        this.patchUpdateGroup = async (req, res, next) => {
            const { groupId } = req.params;
            try {
                const group = await this.groupService.findOneGroup(groupId);
                if (!group)
                    return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
                const updatedData = {
                    ...req.body,
                    position: JSON.parse(req.body.position),
                    skills: JSON.parse(req.body.skills),
                    imageUrl: req.file
                        ? req.file.path
                        : 'imageFile' in req.body
                            ? ''
                            : group.imageUrl,
                };
                if (updatedData.maxMembers &&
                    updatedData.maxMembers < group.currentMembers.length) {
                    return next(new error_handler_1.HttpError('MAX_MEMBERS_EXCEEDED', 422));
                }
                const updatedGroup = await this.groupService.updateGroup(groupId, updatedData);
                if (!updatedGroup)
                    return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
                res.status(204).json();
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                console.log(err);
                return next(error);
            }
        };
        // 그룹 삭제
        this.deleteGroup = async (req, res, next) => {
            const { groupId } = req.params;
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const group = await this.groupService.deleteOnlyGroup(groupId);
                if (!group)
                    return next(new error_handler_1.HttpError('GROUP_NOT_FOUND', 404));
                const deleteJoin = await this.joinService.deleteByJoinReqList(group, userId);
                const deleteCurrentMembers = await this.userService.deleteCurrentMemberInGroup(group, userId, groupId);
                const updateWishList = this.userService.updateUser(userId, {
                    $pull: { wishList: groupId },
                });
                const updateJoinReqeustGroup = this.userService.updateUser(userId, {
                    $pull: { joinRequestGroup: groupId },
                });
                await Promise.allSettled([updateWishList, updateJoinReqeustGroup]).catch((error) => {
                    throw new error_handler_1.HttpError('서버 에러 발생', 500);
                });
                const deletedGroup = await this.groupService.deleteGroup(groupId);
                res.status(204).json();
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 참여 요청 알림기능 추가 예정
        this.joinReqGroup = async (req, res, next) => {
            const { groupId } = req.params;
            const { content } = req.body;
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                // 현재 진행중인 그룹이 4개 이하인지 확인
                const user = await this.userService.getMyInfo(userId);
                if (!user)
                    return next(new error_handler_1.HttpError('USER_NOT_FOUND', 404));
                if (user.ongoingGroup.length > 4)
                    return next(new error_handler_1.HttpError('ONGOINGGROUP_EXIST_4', 400));
                const newJoin = await this.joinService.createJoin(userId, groupId, content);
                const currentGroup = await this.groupService.findOneGroup(groupId);
                if (!currentGroup)
                    return next(new error_handler_1.HttpError('GROUP_NOT_FOUND', 404));
                const updateGroupData = { $push: { joinReqList: newJoin._id } };
                await this.groupService.updateGroup(groupId, updateGroupData);
                const updateUserData = { $push: { joinRequestGroup: groupId } };
                await this.userService.updateUser(userId, updateUserData);
                const notificationData = {
                    receiverId: currentGroup.author.toString().slice(21, 45),
                    senderId: userId,
                    groupId: groupId,
                    content: `${currentGroup.title} 그룹 가입 신청이 들어왔습니다.`,
                    type: currentGroup.type,
                    kind: 'join',
                };
                const newNotification = await this.notificationService.createNotification(notificationData);
                const updateReceiverData = {
                    $push: { notifications: newNotification._id },
                };
                await this.userService.updateUser(currentGroup.author, updateReceiverData);
                res.status(204).json();
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                console.log(err);
                return next(error);
            }
        };
        // 그룹 참여 신청 리스트 조회
        this.getGroupJoinList = async (req, res, next) => {
            const { groupId } = req.params;
            const getData = [];
            try {
                const getGroupJoinList = await this.groupService.findOneGroup(groupId);
                if (!getGroupJoinList)
                    return next(new error_handler_1.HttpError('GROUP_NOT_FOUND', 404));
                const joinReqList = getGroupJoinList.joinReqList;
                if (!joinReqList)
                    return res
                        .status(404)
                        .json({ data: null, error: 'JOINLIST_NOT_FOUND' });
                for (let i = 0; i < joinReqList.length; i++) {
                    const joinReq = await this.joinService.findOneJoin(joinReqList[i].toString());
                    if (!joinReq)
                        return res.status(404).json({ data: null, error: 'JOIN_NOT_FOUND' });
                    const user = await this.userService.getUser(joinReq.userId.toString());
                    if (!user)
                        continue;
                    const data = {
                        nickname: user.nickname,
                        content: joinReq.content,
                        email: user.email,
                        userImage: user.profileImage,
                        links: user.links,
                    };
                    getData.push(data);
                }
                res.json({
                    data: { getData, totalReqCount: joinReqList.length },
                    error: null,
                });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 그룹 신청 승인
        this.approveGroupJoinRequest = async (req, res, next) => {
            const { joinId } = req.params;
            try {
                const userTokenInfo = req.user;
                const groupAuthorId = userTokenInfo.userId;
                const reqJoin = await this.joinService.findOneJoin({ _id: joinId });
                if (!reqJoin)
                    return next(new error_handler_1.HttpError(`JOIN_NOT_FOUND`, 404));
                const { userId, groupId } = reqJoin;
                const user = await this.userService.getUser(userId);
                if (!user)
                    return next(new error_handler_1.HttpError('USER_NOT_FOUND', 404));
                if (user.ongoingGroup.length === 4)
                    return next(new error_handler_1.HttpError('ONGOINGGROUP_EXIST_4', 400));
                const group = await this.groupService.findOneGroup(groupId);
                if (!group) {
                    return next(new error_handler_1.HttpError('GROUP_NOT_FOUND', 404));
                }
                else if (group.currentMembers.length === group.maxMembers) {
                    return next(new error_handler_1.HttpError('FULL_OF_PEOPLE', 403));
                }
                const updateGroupData = {
                    $addToSet: { currentMembers: userId },
                    $pull: { joinReqList: joinId },
                };
                const updatedGroup = await this.groupService.updateGroup(groupId, updateGroupData);
                await this.joinService.deleteOne(joinId);
                if (!updatedGroup)
                    return next(new error_handler_1.HttpError('GROUP_NOT_FOUND', 404));
                const currentMembers = updatedGroup.currentMembers.length;
                const maxMembers = updatedGroup.maxMembers;
                if (currentMembers === maxMembers) {
                    const updatedGroupData = { status: false };
                    await this.groupService.updateGroup(groupId, updatedGroupData);
                }
                const notificationData = {
                    receiverId: userId,
                    senderId: groupAuthorId,
                    groupId: groupId,
                    content: `${group.title} 그룹 가입 신청이 승인되었습니다.`,
                    type: group.type,
                    kind: 'approval',
                };
                const newNotification = await this.notificationService.createNotification(notificationData);
                const updateUserData = {
                    $addToSet: { ongoingGroup: groupId },
                    $pull: { joinRequestGroup: groupId },
                    $push: { notifications: newNotification._id },
                };
                await this.userService.updateUser(userId, updateUserData);
                res.status(204).json();
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
            }
        };
        // 그룹 신청 거절
        this.rejectGroupJoinRequest = async (req, res, next) => {
            const { joinId } = req.params;
            try {
                const userTokenInfo = req.user;
                const groupAuthorId = userTokenInfo.userId;
                const reqJoin = await this.joinService.findOneJoin({ _id: joinId });
                if (!reqJoin)
                    return next(new error_handler_1.HttpError(`JOIN_NOT_FOUND`, 404));
                const { groupId, userId } = reqJoin;
                const updateGroupData = {
                    $pull: { joinReqList: joinId },
                };
                const group = await this.groupService.findOneGroup(groupId);
                if (!group)
                    return next(new error_handler_1.HttpError('GROUP_NOT_FOUND', 404));
                await this.groupService.updateGroup(groupId, updateGroupData);
                await this.joinService.deleteOne(joinId);
                const notificationData = {
                    receiverId: userId,
                    senderId: groupAuthorId,
                    groupId: groupId,
                    content: `${group.title} 그룹 가입 신청이 거절되었습니다.`,
                    type: group.type,
                    kind: 'reject',
                };
                const newNotification = await this.notificationService.createNotification(notificationData);
                const updateUserData = {
                    $pull: { joinRequestGroup: groupId },
                    $push: { notifications: newNotification._id },
                };
                await this.userService.updateUser(userId, updateUserData);
                res.status(204).json();
            }
            catch (err) {
                console.log(err);
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 진행 그룹
        this.getOngoingGroupList = async (req, res, next) => {
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const foundUser = await this.userService.findOngoingGroupList(userId);
                if (!foundUser)
                    return next(new error_handler_1.HttpError(`USER_NOT_FOUND`, 404));
                const getData = foundUser.ongoingGroup;
                res.status(200).json({ data: getData, error: null });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 관심 그룹
        this.getWishGroupList = async (req, res, next) => {
            const type = req.params.type;
            const page = Number(req.query.page);
            const perPage = Number(req.query.perPage);
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const foundUser = await this.userService.getUser(userId);
                if (!foundUser)
                    return next(new error_handler_1.HttpError(`USER_NOT_FOUND`, 404));
                const wishListGroup = foundUser.wishList;
                const totalData = wishListGroup.length;
                const totalPage = Math.ceil(totalData / perPage);
                const groupsInfo = await this.groupService.GroupinUserPagination(wishListGroup, type, page, perPage, totalData);
                res.json({ data: { groupsInfo, totalPage }, error: null });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 생성 그룹
        this.getCreatedGroupList = async (req, res, next) => {
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const foundUser = await this.userService.CreatedGroupList(userId);
                if (!foundUser)
                    return next(new error_handler_1.HttpError(`USER_NOT_FOUND`, 404));
                const createdGroup = foundUser.createdGroup;
                res.json({ data: createdGroup, error: null });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 지원 그룹
        this.getJoinGroupList = async (req, res, next) => {
            const type = req.params.type;
            const page = Number(req.query.page);
            const perPage = Number(req.query.perPage);
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const foundUser = await this.userService.getUser(userId);
                if (!foundUser)
                    return next(new error_handler_1.HttpError(`USER_NOT_FOUND`, 404));
                const joinRequestGroup = foundUser.joinRequestGroup;
                const totalData = joinRequestGroup.length;
                const totalPage = Math.ceil(totalData / perPage);
                const groupsInfo = await this.groupService.GroupinUserPagination(joinRequestGroup, type, page, perPage, totalData);
                res.json({ data: { groupsInfo, totalPage }, error: null });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 관심 그룹 등록 및 해제
        this.patchWishlist = async (req, res, next) => {
            const groupId = req.params.groupId;
            const wishState = req.params.wishState;
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const user = await this.userService.getUser(userId);
                if (wishState === 'true') {
                    const updatedUserData = { $addToSet: { wishList: groupId } };
                    await this.userService.updateUser(userId, updatedUserData);
                    const updatedGroupData = { $inc: { wishCount: 1 } };
                    await this.groupService.updateGroup(groupId, updatedGroupData);
                }
                else {
                    const updatedUserData = { $pull: { wishList: groupId } };
                    await this.userService.updateUser(userId, updatedUserData);
                    const updatedGroupData = { $inc: { wishCount: -1 } };
                    await this.groupService.updateGroup(groupId, updatedGroupData);
                }
                res.status(204).json();
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 그룹 상태 변경
        this.patchChangeStatus = async (req, res, next) => {
            const groupId = req.params.groupId;
            try {
                const updatedGroupData = { status: false };
                await this.groupService.updateGroup(groupId, updatedGroupData);
                res.json({ data: null, error: null });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 지원 리스트 전체 거절
        this.deleteAllJoinReqList = async (req, res, next) => {
            const groupId = req.params.groupId;
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const groupinfo = await this.groupService.findOneGroup(groupId);
                if (!groupinfo)
                    return next(new error_handler_1.HttpError(`GROUP_NOT_FOUND`, 404));
                const result = await this.notificationService.findByjoinReqListAndUpdate(groupinfo.joinReqList, groupId, userId);
                res.status(204).json();
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 지원 취소 (User 입장)
        this.cancelJoinReq = async (req, res, next) => {
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const { groupId } = req.params;
                const condition = {
                    $and: [{ userId: userId }, { groupId: groupId }],
                };
                const foundJoin = await this.joinService.findOneJoinByCondition(condition);
                const updateGroupData = { $pull: { joinReqList: foundJoin?._id } };
                await this.groupService.updateGroup(groupId, updateGroupData);
                const updateUserData = { $pull: { joinRequestGroup: groupId } };
                await this.userService.updateUser(userId, updateUserData);
                await this.joinService.deleteOne(foundJoin?._id);
                res.json({ data: null, error: null });
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 지원 전체 취소 (임시)
        this.cancelAllJoinReq = async (req, res, next) => {
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const updateUserData = { joinRequestGroup: [] };
                await this.userService.updateUser(userId, updateUserData);
                const foundJoinList = await this.joinService.findByUserId(userId); //delete 필요
                const foundJoinIdList = foundJoinList.map((el) => el._id);
                // group의 joinReqList에서 각각 joinId로 찾아서 전부 삭제하는 기능
                const updatedGroup = await this.groupService.findByJoinIdAndUpdate(foundJoinIdList);
                await this.joinService.deleteByUserId(userId);
                res.json({ data: null, error: null });
            }
            catch (err) {
                console.log(err);
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        // 그룹 탈퇴
        this.exitGroup = async (req, res, next) => {
            const { groupId } = req.params;
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const groupInfo = await this.groupService.findOneGroup(groupId);
                if (!groupInfo)
                    return next(new error_handler_1.HttpError('GROUP_NOT_FOUND', 404));
                const userInfo = await this.userService.getUser(userId);
                if (!userInfo)
                    return next(new error_handler_1.HttpError('USER_NOT_FOUND', 404));
                if (userInfo.createdGroup.toString() === groupId)
                    return next(new error_handler_1.HttpError('YOU_FORMED_GROUP', 400));
                const updatedGroupData = { $pull: { currentMembers: userId } };
                const updateedGroup = this.groupService.updateGroup(groupId, updatedGroupData);
                const updateUserData = {
                    $pull: { ongoingGroup: groupId },
                };
                const updateUser = this.userService.updateUser(userId, updateUserData);
                const notificationData = {
                    receiverId: groupInfo.author,
                    senderId: userId,
                    groupId: groupId,
                    content: `${userInfo.nickname}이 ${groupInfo.title} 그룹에서 탈퇴하셨습니다.`,
                    type: groupInfo.type,
                    kind: 'exit',
                };
                const newNotification = await this.notificationService.createNotification(notificationData);
                const updateReceiverData = {
                    $push: { notifications: newNotification._id },
                };
                const updatedReceiver = this.userService.updateUser(groupInfo.author, updateReceiverData);
                Promise.allSettled([updateedGroup, updateUser, updatedReceiver]).catch((error) => {
                    throw new error_handler_1.HttpError('서버 에러 발생', 500);
                });
                res.status(204).json();
            }
            catch (err) {
                console.log(err);
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        this.deleteAllWishList = async (req, res, next) => {
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                await this.userService.updateUser(userId, { wishList: [] });
                res.status(204).json();
            }
            catch (err) {
                console.log(err);
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                console.log(err);
                return next(error);
            }
        };
        this.groupService = groupService;
        this.userService = userService;
        this.joinService = joinService;
        this.notificationService = notificationService;
    }
}
exports.default = GroupController;
