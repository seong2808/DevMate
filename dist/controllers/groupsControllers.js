"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchEndGroup = exports.deleteOneWishlist = exports.patchWishlist = exports.joinGroupList = exports.getCreatedGroupList = exports.getWishGroupList = exports.getOngoingGroupList = exports.rejectGroupJoinRequest = exports.approveGroupJoinRequest = exports.getGroupJoinList = exports.joinReqGroup = exports.deleteGroup = exports.patchGroup = exports.postGroup = exports.getGroup = exports.getHotGroups = exports.getAllGroups = void 0;
const User_1 = __importDefault(require("../models/User"));
const Group_1 = __importDefault(require("../models/Group"));
const Join_1 = __importDefault(require("../models/Join"));
const Notification_1 = __importDefault(require("../models/Notification"));
const mongoose_1 = __importDefault(require("mongoose"));
const TEMP_USER_ID = '64dc65801ded8e6a83b9d760';
// 전체 그룹 조회
const getAllGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const type = req.query.type;
        const location = req.query.location;
        const sortByTime = req.query.sortByTime === 'false' ? false : true || true;
        const page = Number(req.query.page);
        const perPage = Number(req.query.perPage) || 8;
        const position = req.query.position;
        const newPosition = position === null || position === void 0 ? void 0 : position.split(',');
        const skill = req.query.skills;
        const newSkill = skill === null || skill === void 0 ? void 0 : skill.split(',');
        const sortCriteria = {};
        sortByTime ? (sortCriteria.createdAt = -1) : (sortCriteria.viewCount = -1);
        const groups = yield Group_1.default.find(newPosition || location || newSkill || type
            ? {
                $and: [
                    newPosition ? { position: { $in: newPosition } } : {},
                    location ? { location: location } : {},
                    newSkill ? { skills: { $in: newSkill } } : {},
                    type ? { type: type } : {},
                    { status: '모집중' },
                ],
            }
            : {
                status: '모집중',
            })
            .sort(sortByTime ? { createdAt: -1 } : { viewCount: -1 })
            .skip(perPage * (page - 1))
            .limit(perPage);
        const data = yield Group_1.default.find(newPosition || location || newSkill || type
            ? {
                $and: [
                    newPosition ? { position: { $in: newPosition } } : {},
                    location ? { location: location } : {},
                    newSkill ? { skills: { $in: newSkill } } : {},
                    type ? { type: type } : {},
                    { status: '모집중' },
                ],
            }
            : { status: '모집중' });
        const total = data.length;
        const totalPage = Math.ceil(total / perPage);
        res.json({
            data: {
                groups,
                totalPage,
            },
            error: null,
        });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.getAllGroups = getAllGroups;
// 상위 4개 그룹 조회
const getHotGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getData = yield Group_1.default.find().sort({ viewCount: -1 }).limit(4);
        if (!getData)
            return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
        res.json({ data: { getData }, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.getHotGroups = getHotGroups;
// 그룹 상세 조회(조회수 추가)
const getGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const group = yield Group_1.default.findById(groupId)
            .populate('author', 'nickName')
            .populate('currentMembers', 'nickName');
        if (!group) {
            return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
        }
        res.json({ data: { group }, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.getGroup = getGroup;
// 그룹 생성
const postGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const createGruopDto = req.body;
        if (!req.user) {
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        }
        const userTokenInfo = req.user;
        const userId = userTokenInfo.userId;
        const user = yield User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        const userCreatedGroup = user.createdGroup;
        if (userCreatedGroup || mongoose_1.default.isValidObjectId(userCreatedGroup))
            return res.status(400).json({ data: null, error: 'GROUP_EXISTS' });
        const groupData = Object.assign(Object.assign({}, createGruopDto), { position: JSON.parse(req.body.position), skills: JSON.parse(req.body.skills), author: userId, currentMembers: [userId], imageUrl: req.file ? req.file.path : '' });
        const newGroup = new Group_1.default(groupData);
        const createdGroup = yield newGroup.save();
        const updatedData = yield User_1.default.findByIdAndUpdate(userId, { createdGroup: createdGroup._id }, { new: true });
        console.log(updatedData, updatedData === null || updatedData === void 0 ? void 0 : updatedData.createdGroup.prototype);
        res.json({ data: null, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.postGroup = postGroup;
//그룹 수정
const patchGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const updatedData = Object.assign({}, req.body);
        const currentGroup = yield Group_1.default.findById(groupId);
        if (!currentGroup)
            return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
        if (updatedData.maxMembers &&
            updatedData.maxMembers < currentGroup.currentMembers.length) {
            return res
                .status(422)
                .json({ data: null, error: 'MAX_MEMBERS_EXCEEDED' });
        }
        yield Group_1.default.findByIdAndUpdate(groupId, updatedData, {
            new: true,
        });
        return res.json({ data: null, error: null });
    }
    catch (err) {
        return res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.patchGroup = patchGroup;
// 그룹 삭제
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const group = yield Group_1.default.findByIdAndRemove(groupId);
        // if (!group) {
        //   return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
        // }
        yield Join_1.default.deleteMany({ groupId });
        yield User_1.default.updateMany({ ongoingGroup: groupId }, { $pull: { ongoingGroup: groupId } });
        yield User_1.default.updateMany({ endGroup: groupId }, { $pull: { endGroup: groupId } });
        yield User_1.default.updateMany({ createdGroup: groupId }, { $pull: { createdGroup: groupId } });
        res.json({ data: null, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.deleteGroup = deleteGroup;
// 그룹 참여 요청
const joinReqGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const { userId, content } = req.body;
        const newJoin = new Join_1.default({ userId, groupId, content });
        const saveJoin = yield newJoin.save();
        const currentGroup = yield Group_1.default.findById(groupId);
        if (!currentGroup)
            return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
        yield Group_1.default.findByIdAndUpdate(groupId, { $push: { joinReqList: saveJoin._id } }, {
            new: true,
        });
        yield User_1.default.findByIdAndUpdate(userId, { $push: { joinRequestGroup: groupId } }, {
            new: true,
        });
        const createdNotification = new Notification_1.default({
            receiverId: currentGroup.author,
            senderId: userId,
            groupId: groupId,
            type: currentGroup.type,
            kind: 'join',
            status: true,
        });
        res.json({ data: null, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.joinReqGroup = joinReqGroup;
// 그룹 참여 신청 리스트
const getGroupJoinList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const getData = [];
        const { groupId } = req.params;
        const getGroupJoinList = yield Group_1.default.findById(groupId);
        const joinReqList = (_a = getGroupJoinList === null || getGroupJoinList === void 0 ? void 0 : getGroupJoinList.joinReqList) !== null && _a !== void 0 ? _a : [];
        const page = Number(req.query.page);
        const perPage = Number(req.query.perPage);
        const total = joinReqList.length;
        const totalPage = Math.ceil(total / perPage);
        if (!joinReqList)
            return res.status(404).json({ data: null, error: 'JOINLIST_NOT_FOUND' });
        let limit = 0;
        for (let i = (page - 1) * perPage; i < total; i++) {
            if (limit === perPage)
                break;
            const joinReq = yield Join_1.default.findById(joinReqList[i]);
            const user = yield User_1.default.findById(joinReq === null || joinReq === void 0 ? void 0 : joinReq.userId);
            if (!joinReq || !user)
                continue;
            const data = {
                nickname: user.nickname,
                content: joinReq.content,
                email: user.email,
                userImage: user.profileImage,
                links: user.links,
            };
            getData.push(data);
            limit++;
        }
        res.json({
            data: { getData, totalPage, totalReqCount: total },
            error: null,
        });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.getGroupJoinList = getGroupJoinList;
// 그룹 신청 승인
const approveGroupJoinRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { joinId } = req.params;
        const reqJoin = yield Join_1.default.findById({ _id: joinId });
        if (!reqJoin)
            return res.status(404).json({ data: null, error: `JOIN_NOT_FOUND` });
        const { groupId, userId } = reqJoin;
        // 그룹에 현재 멤버 업데이트
        const updatedGroup = yield Group_1.default.findByIdAndUpdate(groupId, {
            $addToSet: { currentMembers: userId },
            $pull: { joinReqList: joinId },
        }, { new: true });
        // 유저에 속해 있는 그룹 업데이트
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { $addToSet: { groups: groupId }, $pull: { joinRequestGroup: groupId } }, { new: true });
        //해당 Join 삭제
        const deletedJoin = yield Join_1.default.deleteOne({ _id: joinId });
        res.status(204).json();
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.approveGroupJoinRequest = approveGroupJoinRequest;
// 그룹 신청 거절
const rejectGroupJoinRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { joinId } = req.params;
        const reqJoin = yield Join_1.default.findById({ _id: joinId });
        if (!reqJoin)
            return res.status(404).json({ data: null, error: `JOIN_NOT_FOUND` });
        const { groupId, userId } = reqJoin;
        // 그룹에 현재 멤버 업데이트
        yield Group_1.default.findByIdAndUpdate(groupId, {
            $pull: { joinReqList: joinId },
        }, { new: true });
        console.log(userId);
        yield User_1.default.findByIdAndUpdate(userId, {
            $pull: { joinRequestGroup: groupId },
        }, { new: true });
        const deletedJoin = yield Join_1.default.deleteOne({ _id: joinId });
        res.status(204).json();
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.rejectGroupJoinRequest = rejectGroupJoinRequest;
// 진행 그룹
const getOngoingGroupList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 토큰에서 user 고유 Id 가져오는 코드
        if (!req.user) {
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        }
        const userTokenInfo = req.user;
        const userId = userTokenInfo.userId;
        const foundUser = yield User_1.default.findById(userId).populate('groups');
        if (!foundUser)
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND!!' });
        const getData = foundUser.ongoingGroup;
        const fillteredData = getData.filter((data) => data.status !== '종료');
        res.status(200).json({ data: { fillteredData }, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.getOngoingGroupList = getOngoingGroupList;
// 관심 그룹
const getWishGroupList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 토큰에서 user 고유 Id 가져오는 코드
        if (!req.user) {
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        }
        const userTokenInfo = req.user;
        const userId = userTokenInfo.userId;
        const foundUser = yield User_1.default.findById(userId).populate('wishList');
        if (!foundUser)
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND!!' });
        const wishList = foundUser.wishList;
        res.status(200).json({ data: { wishList }, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.getWishGroupList = getWishGroupList;
// 생성 그룹
const getCreatedGroupList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 토큰에서 user 고유 Id 가져오는 코드
        if (!req.user) {
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND!!' });
        }
        const userTokenInfo = req.user;
        const userId = userTokenInfo.userId;
        const foundUser = yield User_1.default.findById(userId).populate('createdGroup');
        if (!foundUser)
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        const createdGroup = foundUser.createdGroup;
        res.status(200).json({ data: { createdGroup }, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.getCreatedGroupList = getCreatedGroupList;
// 지원 그룹
const joinGroupList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 토큰에서 user 고유 Id 가져오는 코드
        if (!req.user) {
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        }
        const userTokenInfo = req.user;
        const userId = userTokenInfo.userId;
        const foundUser = yield User_1.default.findById(userId).populate('joinRequestGroup');
        if (!foundUser)
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        const joinRequestGroup = foundUser.joinRequestGroup;
        res.status(200).json({ data: { joinRequestGroup }, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.joinGroupList = joinGroupList;
// 관심 그룹 등록
const patchWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 토큰에서 user 고유 Id 가져오는 코드
        if (!req.user) {
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        }
        const userTokenInfo = req.user;
        const userId = userTokenInfo.userId;
        const { groupId } = req.params;
        // 유저에 속해 있는 그룹 업데이트
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { $addToSet: { wishList: groupId } }, { new: true });
        res.status(200).json({ data: null, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.patchWishlist = patchWishlist;
// 관심 그룹 해제
const deleteOneWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 토큰에서 user 고유 Id 가져오는 코드
        if (!req.user) {
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        }
        const userTokenInfo = req.user;
        const userId = userTokenInfo.userId;
        const { groupId } = req.params;
        // 유저에 속해 있는 그룹 업데이트
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { $pull: { wishList: groupId } }, { new: true });
        res.status(200).json({ data: null, error: null });
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.deleteOneWishlist = deleteOneWishlist;
// 그룹 종료
const patchEndGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
        }
        const userTokenInfo = req.user;
        const userId = userTokenInfo.userId;
        const { groupId } = req.params;
        yield Group_1.default.findByIdAndUpdate(groupId, { status: '종료' }, { new: true });
        yield User_1.default.findByIdAndUpdate(userId, { createdGroup: null }, { new: true });
        yield User_1.default.updateMany({ ongoingGroup: groupId }, {
            $pull: { ongoingGroup: groupId },
            $push: { endGroup: groupId },
        }, { new: true });
        res.status(204).json();
    }
    catch (err) {
        res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
});
exports.patchEndGroup = patchEndGroup;
