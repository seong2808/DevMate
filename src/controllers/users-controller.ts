import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { IUser, reqUserInfo } from '../types/users-types';
import generateJWT from '../utils/generate-jwt';
import hashPassword from '../utils/hash-password';
import { HttpError } from '../middlewares/error.handler';
import UserService from '../services/users-service';
import GroupService from '../services/groups-service';
import JoinService from '../services/join-service';
import NotificationService from '../services/notification-service';
import Group from '../models/Group';

class UserController {
  private userService: UserService;
  private groupService: GroupService;
  private joinService: JoinService;
  private notificationService: NotificationService;

  constructor(
    userService: UserService,
    groupService: GroupService,
    joinService: JoinService,
    notificationService: NotificationService,
  ) {
    this.userService = userService;
    this.groupService = groupService;
    this.joinService = joinService;
    this.notificationService = notificationService;
  }

  // 내 정보 조회
  getMyInfo = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as reqUserInfo;

    if (!user) {
      return next(
        new HttpError('인증되지 않은 유저입니다. 로그인 해주세요', 401),
      );
    }

    const userId: string = user.userId;
    try {
      const foundUser = await this.userService.getUser(userId);

      if (!foundUser) {
        return next(new HttpError('사용자를 찾을 수 없습니다.', 404));
      }

      res.json({
        data: { foundUser },
        error: null,
      });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 다른 사람 정보 조회
  getUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId: string = req.params.userId;

    try {
      const foundUser = await this.userService.getUser(userId);

      if (!foundUser) {
        return next(new HttpError('사용자를 찾을 수 없습니다.', 404));
      }

      res.json({
        data: { foundUser },
        error: null,
      });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 로그인
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email: string = req.body.email;
      const foundUser = await this.userService.findUserByEmail(email);
      if (!foundUser) {
        return next(new HttpError('사용자를 찾을 수 없습니다.', 404));
      }

      const userId = foundUser._id;
      const user = { userId: userId, email: email };
      generateJWT(res, user);
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 사용자 회원가입
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, nickname, password }: IUser = req.body;
    try {
      // 이메일 중복 여부 체크
      const existingUser = await this.userService.findUserByEmail(email);
      if (existingUser) {
        return next(new HttpError('이미 존재하는 이메일입니다.', 409));
      }
    } catch (err) {
      return next(new HttpError('서버 에러 발생', 500));
    }

    const hashedPassword = await hashPassword(password);
    const createdUser = new User({ email, nickname, password: hashedPassword });

    try {
      await createdUser.save();
      res.status(201).json({
        data: { message: '회원 가입 성공' },
        error: null,
      });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 사용자 정보 수정
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const userTokenInfo = req.user as reqUserInfo;
    const userId: string = userTokenInfo.userId;
    const foundUser = await this.userService.getUser(userId);

    const { body } = req;
    const updates: IUser = {
      ...body,
      links: JSON.parse(body.links),
      skills: JSON.parse(body.skills),
    };
    if (updates.password) {
      return next(
        new HttpError('요청에서 허용되지 않는 정보를 포함하고 있습니다.', 400),
      );
    }

    updates.profileImage = req.file
      ? req.file.path
      : 'imageFile' in updates
      ? ''
      : foundUser?.profileImage;

    try {
      const updatedUser = await this.userService.updateUser(userId, updates);
      res.json({
        data: { updatedUser },
        error: null,
      });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  //사용자 정보 삭제 (회원 탈퇴)
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const userTokenInfo = req.user as reqUserInfo;
    const userId: string = userTokenInfo.userId;

    try {
      const foundUser = await this.userService.getUser(userId);
      //생성 그룹 존재시 에러발생
      if (foundUser?.createdGroup) {
        return next(
          new HttpError(
            '회원 탈퇴를 진행할 수 없습니다. 생성한 그룹을 삭제하고 다시 시도해주세요.',
            409,
          ),
        );
      }
      // Group 해당 User 데이터 삭제
      // currentMember에 탈퇴userId가 존재하면 제거
      await Group.updateMany(
        { currentMembers: userId },
        { $pull: { currentMembers: userId } },
      );

      // Join 해당 User 데이터 삭제
      await this.joinService.deleteManyByUserId(userId);

      // Notification 해당 User 데이터 삭제
      await this.notificationService.deleteAll(userId);

      // User 스키마에서 해당 User 삭제
      await this.userService.deleteUser(userId);

      res.status(204).json({ message: '삭제 완료' });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 로그아웃
  logOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie('token', { path: '/' });
      res.json({ message: '로그아웃 성공' });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };
}

export default UserController;
