"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
class UserService {
    // 전체 정보 조회
    async getAllUsers() {
        const allUsers = await User_1.default.find();
        return allUsers;
    }
    // 내 정보 조회
    async getMyInfo(userId) {
        const foundUser = await User_1.default.findById(userId, '-password');
        return foundUser;
    }
    //
    async getUser(userId) {
        const foundUser = await User_1.default.findById(userId, '-password');
        return foundUser;
    }
    async findUserByEmail(email) {
        const foundUser = await User_1.default.findOne({ email });
        return foundUser;
    }
    async findUserById(userId) {
        const foundUser = await User_1.default.findById(userId);
        return foundUser;
    }
    async updateUser(userId, updates) {
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, updates, {
            new: true,
            select: '-password',
        });
        return updatedUser;
    }
    async deleteUser(userId) {
        await User_1.default.findByIdAndDelete(userId);
    }
    async findOngoingGroupList(userId) {
        const foundUser = await User_1.default.findById(userId).populate('ongoingGroup');
        return foundUser;
    }
    async findWishGroupList(userId) {
        const foundUser = await User_1.default.findById(userId).populate('wishList');
        return foundUser;
    }
    async CreatedGroupList(userId) {
        const foundUser = await User_1.default.findById(userId).populate('createdGroup');
        return foundUser;
    }
    async deleteCurrentMemberInGroup(group, userId, groupId) {
        const currentMembers = group.currentMembers;
        Promise.allSettled(currentMembers.map(async (memberId) => {
            const notificationData = {
                receiverId: memberId,
                senderId: userId,
                groupId: groupId,
                content: `${group.title} 그룹이 삭제되었습니다.`,
                type: group.type,
                kind: 'delete',
            };
            const notification = new Notification_1.default(notificationData);
            const newNotification = await notification.save();
            const user = await User_1.default.findByIdAndUpdate(memberId, {
                $pull: { ongoingGroup: group._id },
                $push: { notifications: newNotification._id },
            });
        }));
        return;
    }
}
exports.default = UserService;
