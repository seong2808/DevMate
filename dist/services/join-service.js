"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Join_1 = __importDefault(require("../models/Join"));
const Notification_1 = __importDefault(require("../models/Notification"));
class JoinService {
    async deleteManyByGroupId(groupId) {
        await Join_1.default.deleteMany({ groupId: { $in: groupId } });
        return;
    }
    async deleteManyByUserId(userId) {
        const join = await Join_1.default.deleteMany({ userId: userId });
        return join;
    }
    async createJoin(userId, groupId, content) {
        const newJoin = new Join_1.default({ userId, groupId, content });
        const join = await newJoin.save();
        return join;
    }
    async findOneJoin(joinId) {
        const join = await Join_1.default.findById(joinId);
        return join;
    }
    async findJoinInGroup(joinId) {
        const join = await Join_1.default.findById(joinId).populate('groupId');
        return join;
    }
    async deleteOne(joinId) {
        const deletedJoin = await Join_1.default.findByIdAndDelete({ _id: joinId });
        return deletedJoin;
    }
    async findByGroupId(groupId) {
        const join = await Join_1.default.find({ groupId: groupId });
        return join;
    }
    async findByUserId(userId) {
        const join = await Join_1.default.find({ userId: userId });
        return join;
    }
    async findOneJoinByCondition(condition) {
        const foundJoin = await Join_1.default.findOne(condition);
        return foundJoin;
    }
    async deleteByUserId(userId) {
        const deletedJoins = await Join_1.default.deleteMany({ userId: userId });
        return deletedJoins;
    }
    async deleteByJoinReqList(group, userId) {
        const joinReqList = group.joinReqList;
        Promise.allSettled(joinReqList.map(async (joinUserId) => {
            const join = await Join_1.default.findByIdAndDelete({ _id: joinUserId });
            if (join) {
                const notificationData = {
                    receiverId: joinUserId,
                    senderId: userId,
                    groupId: group._id,
                    content: `${group.title} 그룹 가입 신청이 거절되었습니다.`,
                    type: group.type,
                    kind: 'reject',
                };
                const notification = new Notification_1.default(notificationData);
                const newNotification = await notification.save();
            }
        }));
        return {};
    }
}
exports.default = JoinService;
