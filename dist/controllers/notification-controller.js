"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_handler_1 = require("../middlewares/error.handler");
class NotificationController {
    constructor(notificationService, userService) {
        this.getAllnotification = async (req, res, next) => {
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const getAll = await this.notificationService.getNotificationByUserId(userId);
                if (getAll?.notifications.length === 0)
                    return next(new error_handler_1.HttpError('NOTIFICATION_NOT_FOUND', 404));
                res.json({ data: getAll?.notifications, error: null });
            }
            catch (err) {
                console.log(err);
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        this.deleteNotification = async (req, res, next) => {
            const notificationId = req.params.notificationId;
            try {
                await this.notificationService.deleteByNotificationId(notificationId);
                res.status(204).json();
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        this.deleteAllNotification = async (req, res, next) => {
            try {
                const userTokenInfo = req.user;
                const userId = userTokenInfo.userId;
                const updateUserData = { notifications: [] };
                const result = await this.userService.updateUser(userId, updateUserData);
                const notiResult = await this.notificationService.deleteAll(userId);
                res.status(204).json();
            }
            catch (err) {
                const error = new error_handler_1.HttpError('서버 에러 발생', 500);
                return next(error);
            }
        };
        this.notificationService = notificationService;
        this.userService = userService;
    }
}
exports.default = NotificationController;
