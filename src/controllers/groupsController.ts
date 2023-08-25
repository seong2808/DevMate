import { Request, Response, NextFunction } from 'express';
import GroupsService from '../services/groups-service';
import { HttpError } from '../middlewares/error.handler';
import { reqUserInfo } from '../types/users-types';
import UsersService from '../services/users-service';

class GroupController {
  private groupsService: GroupsService;
  private usersService: UsersService;

  constructor(groupsService: GroupsService, usersService: UsersService) {
    this.groupsService = groupsService;
    this.usersService = usersService;
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
      console.log('1');
      const userTokenInfo = req.user as reqUserInfo;
      const userId: string = userTokenInfo.userId;
      console.log(userId);
      const user = await this.usersService.oneUser(userId);
      if (!user) {
        return next(new HttpError('USER_NOT_FOUND', 404));
      }
      console.log(user);
      // const userCreatedGroup = user.createdGroup;

      //   const groupData: object = {
      //     ...createGruopDto,
      //     position: JSON.parse(req.body.position),
      //     skills: JSON.parse(req.body.skills),
      //     author: userId,
      //     currentMembers: [userId],
      //     imageUrl: req.file ? req.file.path : '',
      //   };

      //   await this.groupsService.createGroup(userId, groupData);

      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  patchGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
