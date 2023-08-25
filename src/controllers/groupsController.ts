import { Request, Response, NextFunction } from 'express';
import GroupsService from '../services/groups-service';
import { HttpError } from '../middlewares/error.handler';
import { reqUserInfo } from '../types/users-types';
import UsersService from '../services/users-service';
import mongoose from 'mongoose';
import JoinService from '../services/join-service';

class GroupController {
  private groupsService: GroupsService;
  private usersService: UsersService;
  private joinService: JoinService;

  constructor(
    groupsService: GroupsService,
    usersService: UsersService,
    joinService: JoinService,
  ) {
    this.groupsService = groupsService;
    this.usersService = usersService;
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
      const getGroup = await this.groupsService.findAllGroup(
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
      const getGroup = await this.groupsService.findHotGroup();

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
      const getGroup = await this.groupsService.findOneGroup(groupId);

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
      const user = await this.usersService.getMyInfo(userId);

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

      await this.groupsService.createGroup(userId, groupData);

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
      const group = await this.groupsService.findOneGroup(groupId);
      if (!group)
        return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });

      if (
        updatedData.maxMembers &&
        updatedData.maxMembers < group.currentMembers.length
      ) {
        return next(new HttpError('MAX_MEMBERS_EXCEEDED', 422));
      }

      const updatedGroup = await this.groupsService.updateGroup(
        groupId,
        updatedData,
      );
      if (!updatedGroup)
        return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
      res.json({ data: null, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    try {
      const group = await this.groupsService.deleteOnlyGroup(groupId);
      if (!group) return next(new HttpError('GROUP_NOT_FOUND', 404));

      const deleteManyJoin = await this.joinService.deleteManyJoin(groupId);
      const deletedGroup = await this.groupsService.deleteGroup(groupId);
      res.json({ data: null, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  joinReqGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const { userId, content } = req.body;
    try {
      const newJoin = await this.joinService.createJoin(
        userId,
        groupId,
        content,
      );
      const currentGroup = await this.groupsService.findOneGroup(groupId);
      if (!currentGroup) return next(new HttpError('GROUP_NOT_FOUND', 404));

      const updateGroupData = { $push: { joinReqList: newJoin._id } };
      await this.groupsService.updateGroup(groupId, updateGroupData);

      const updateUserData = { $push: { joinRequestGroup: groupId } };
      // 마저 수정하기

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
