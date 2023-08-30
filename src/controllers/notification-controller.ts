import { NextFunction, Request, Response } from 'express';
import NotificationService from '../services/notification-service';
import { HttpError } from '../middlewares/error.handler';
import { reqUserInfo } from '../types/users-types';
import UserService from '../services/users-service';

class NotificationController {
  private readonly notificationService: NotificationService;
  private readonly userService: UserService;
  constructor(
    notificationService: NotificationService,
    userService: UserService,
  ) {
    this.notificationService = notificationService;
    this.userService = userService;
  }
  // 유저 알림 전체 조회
  getAllnotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const userTokenInfo = req.user as reqUserInfo;
    const userId: string = userTokenInfo.userId;

    try {
      const getAll = await this.notificationService.getNotificationByUserId(
        userId,
      );
      if (getAll?.notifications.length === 0)
        return next(new HttpError('NOTIFICATION_NOT_FOUND', 404));

      res.json({ data: getAll?.notifications, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 알림 삭제
  deleteNotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const notificationId = req.params.notificationId;

    try {
      await this.notificationService.deleteByNotificationId(notificationId);
      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 알림 전체 삭제
  deleteAllNotification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const userTokenInfo = req.user as reqUserInfo;
    const userId: string = userTokenInfo.userId;

    try {
      const updateUserData = { notifications: [] };

      const result = await this.userService.updateUser(userId, updateUserData);
      const notiResult = await this.notificationService.deleteAll(userId);
      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };
}

export default NotificationController;
