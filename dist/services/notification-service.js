"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = __importDefault(require("../models/Notification"));
const User_1 = __importDefault(require("../models/User"));
const Join_1 = __importDefault(require("../models/Join"));
const Group_1 = __importDefault(require("../models/Group"));
const error_handler_1 = require("../middlewares/error.handler");
class NotificationService {
    async createNotification(notificationData) {
        const newNotification = new Notification_1.default(notificationData);
        const data = await newNotification.save();
        return data;
    }
    async getNotificationByUserId(userId) {
        const userNotification = await User_1.default.findById(userId).populate('notifications');
        return userNotification;
    }
    async deleteByNotificationId(notificationId) {
        const deleteData = await Notification_1.default.deleteOne({ _id: notificationId });
        return deleteData;
    }
    async deleteAll(userId) {
        const deleteData = await Notification_1.default.deleteMany({ receiverId: userId });
        return deleteData;
    }
    async findByjoinReqListAndUpdate(joinReqList, groupId, userId) {
        Promise.allSettled(joinReqList.map(async (joinId) => {
            const join = await Join_1.default.findByIdAndDelete({ _id: joinId });
            const group = await Group_1.default.findByIdAndUpdate(groupId, {
                $pull: { joinReqList: joinId },
            });
            if (join && group) {
                const notificationData = {
                    receiverId: join._id,
                    senderId: userId,
                    groupId: groupId,
                    content: `${group.title} 그룹 가입 신청이 거절되었습니다.`,
                    type: group.type,
                    kind: 'reject',
                };
                const notification = new Notification_1.default(notificationData);
                const newNotification = await notification.save();
                const newUser = await User_1.default.findByIdAndUpdate(join.userId, {
                    $pull: { joinRequestGroup: groupId },
                    $push: { notifications: newNotification._id },
                }, { new: true });
            }
        }))
            .then((result) => console.log('result : ', result))
            .catch((err) => {
            console.log(err);
            throw new error_handler_1.HttpError('서버 에러 발생', 500);
        });
    }
}
exports.default = NotificationService;
