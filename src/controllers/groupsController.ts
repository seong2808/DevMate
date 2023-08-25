import { Request, Response, NextFunction } from 'express';
import GroupService from '../services/groups-service';
import { HttpError } from '../middlewares/error.handler';
import { reqUserInfo } from '../types/users-types';
import UserService from '../services/users-service';
import mongoose from 'mongoose';
import JoinService from '../services/join-service';
import { throws } from 'assert';

class GroupController {
  private groupService: GroupService;
  private userService: UserService;
  private joinService: JoinService;

  constructor(
    groupService: GroupService,
    userService: UserService,
    joinService: JoinService,
  ) {
    this.groupService = groupService;
    this.userService = userService;
    this.joinService = joinService;
  }

  getAllGroup = async (req: Request, res: Response, next: NextFunction) => {
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
      const getGroup = await this.groupService.findAllGroup(
        page,
        perPage,
        type,
        location,
        newPosition,
        newSkill,
        sortByTime,
      );

      if (getGroup.groups === null)
        return next(new HttpError('NOT_FOUND_GROUP', 404));

      res.json({ data: getGroup, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  getHotGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const getGroup = await this.groupService.findHotGroup();

      if (getGroup === null) return next(new HttpError('NOT_FOUND_GROUP', 404));

      res.json({ data: getGroup, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  getGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    try {
      const getGroup = await this.groupService.findOneGroup(groupId);

      if (getGroup === null) return next(new HttpError('GROUP_NOT_FOUND', 404));

      res.json({ data: getGroup, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  postCreateGroup = async (req: Request, res: Response, next: NextFunction) => {
    const createGruopDto = req.body;
    try {
      if (!req.user) {
        return next(new HttpError('USER_NOT_FOUND', 404));
      }
      const userTokenInfo = req.user as reqUserInfo;
      const userId: string = userTokenInfo.userId;
      const user = await this.userService.getMyInfo(userId);

      if (!user) {
        return next(new HttpError('USER_NOT_FOUND', 404));
      }
      const userCreatedGroup = user.createdGroup;

      if (userCreatedGroup || mongoose.isValidObjectId(userCreatedGroup))
        return res.status(400).json({ data: null, error: 'GROUP_EXISTS' });

      const groupData: object = {
        ...createGruopDto,
        position: JSON.parse(req.body.position),
        skills: JSON.parse(req.body.skills),
        author: userId,
        currentMembers: [userId],
        imageUrl: req.file ? req.file.path : '',
      };

      await this.groupService.createGroup(userId, groupData);

      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  patchUpdateGroup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { groupId } = req.params;
    const updatedData = { ...req.body };
    try {
      const group = await this.groupService.findOneGroup(groupId);
      if (!group)
        return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });

      if (
        updatedData.maxMembers &&
        updatedData.maxMembers < group.currentMembers.length
      ) {
        return next(new HttpError('MAX_MEMBERS_EXCEEDED', 422));
      }

      const updatedGroup = await this.groupService.updateGroup(
        groupId,
        updatedData,
      );
      if (!updatedGroup)
        return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    try {
      const group = await this.groupService.deleteOnlyGroup(groupId);
      if (!group) return next(new HttpError('GROUP_NOT_FOUND', 404));

      const deleteManyJoin = await this.joinService.deleteManyByGroupId(
        groupId,
      );
      const deletedGroup = await this.groupService.deleteGroup(groupId);
      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 참여 요청 알림기능 추가 예정
  joinReqGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const { userId, content } = req.body;
    try {
      const newJoin = await this.joinService.createJoin(
        userId,
        groupId,
        content,
      );
      const currentGroup = await this.groupService.findOneGroup(groupId);
      if (!currentGroup) return next(new HttpError('GROUP_NOT_FOUND', 404));

      const updateGroupData = { $push: { joinReqList: newJoin._id } };
      await this.groupService.updateGroup(groupId, updateGroupData);

      const updateUserData = { $push: { joinRequestGroup: groupId } };
      await this.userService.updateUser(userId, updateUserData);

      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  getGroupJoinList = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { groupId } = req.params;
    const getData: object[] = [];
    try {
      const getGroupJoinList = await this.groupService.findOneGroup(groupId);
      if (!getGroupJoinList) return next(new HttpError('GROUP_NOT_FOUND', 404));

      const joinReqList = getGroupJoinList.joinReqList;
      if (!joinReqList)
        return res
          .status(404)
          .json({ data: null, error: 'JOINLIST_NOT_FOUND' });

      const page = Number(req.query.page);
      const perPage = Number(req.query.perPage);
      const total = joinReqList.length;
      const totalPage = Math.ceil(total / perPage);

      let limit = 0;

      for (let i = (page - 1) * perPage; i < total; i++) {
        if (limit === perPage) break;

        const joinReq = await this.joinService.findOneJoin(
          joinReqList[i].toString(),
        );
        if (!joinReq)
          return res.status(404).json({ data: null, error: 'JOIN_NOT_FOUND' });

        const user = await this.userService.getUser(joinReq.userId.toString());
        if (!user) continue;
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
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 그룹 신청 승인
  approveGroupJoinRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { joinId } = req.params;
    try {
      const reqJoin = await this.joinService.findOneJoin({ _id: joinId });
      if (!reqJoin) return next(new HttpError(`JOIN_NOT_FOUND`, 404));

      const { groupId, userId } = reqJoin;
      const updateGroupData = {
        $addToSet: { currentMembers: userId },
        $pull: { joinReqList: joinId },
      };
      await this.groupService.updateGroup(groupId, updateGroupData);
      const updateUserData = {
        $addToSet: { ongoingGroup: groupId },
        $pull: { joinRequestGroup: groupId },
      };
      await this.userService.updateUser(userId, updateUserData);

      await this.joinService.deleteOne({ _id: joinId });

      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 그룹 신청 거절
  rejectGroupJoinRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { joinId } = req.params;
    try {
      const reqJoin = await this.joinService.findOneJoin({ _id: joinId });
      if (!reqJoin) return next(new HttpError(`JOIN_NOT_FOUND`, 404));

      const { groupId, userId } = reqJoin;
      const updateGroupData = {
        $pull: { joinReqList: joinId },
      };
      await this.groupService.updateGroup(groupId, updateGroupData);
      const updateUserData = {
        $pull: { joinRequestGroup: groupId },
      };
      await this.userService.updateUser(userId, updateUserData);

      await this.joinService.deleteOne({ _id: joinId });

      res.json({ data: null, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  getOngoingGroupList = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError('USER_NOT_FOUND', 404));
      }
      const userTokenInfo = req.user as reqUserInfo;
      const userId: string = userTokenInfo.userId;
      const foundUser = await this.userService.findOngoingGroupList(userId);
      if (!foundUser) return next(new HttpError(`USER_NOT_FOUND`, 404));

      res.json({ data: null, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  qweqweGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: null, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };
}

export default GroupController;
