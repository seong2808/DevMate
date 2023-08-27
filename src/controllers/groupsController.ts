import { Request, Response, NextFunction } from 'express';
import GroupService from '../services/groups-service';
import { HttpError } from '../middlewares/error.handler';
import { reqUserInfo } from '../types/users-types';
import UserService from '../services/users-service';
import mongoose from 'mongoose';
import JoinService from '../services/join-service';
import { throws } from 'assert';
import { unwatchFile } from 'fs';

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

  // 전체 그룹 조회
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

  // ViewCount 상위 4개 그룹 조회
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

  //  그룹 상세 조회(조회 수 추가)
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

  // 그룹 생성
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

  // 그룹 수정
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

  // 그룹 삭제
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
    const { content } = req.body;
    try {
      if (!req.user) {
        return next(new HttpError('USER_NOT_FOUND', 404));
      }
      const userTokenInfo = req.user as reqUserInfo;
      const userId: string = userTokenInfo.userId;

      // 현재 진행중인 그룹이 4개 이하인지 확인
      const user = await this.userService.getMyInfo(userId);
      if (!user) return next(new HttpError('USER_NOT_FOUND', 404));
      if (user.ongoingGroup.length > 4)
        return next(new HttpError('ONGOINGGROUP_EXIST_4', 400));

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

  // 그룹 참여 신청 리스트 조회
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
      const reqJoin = await this.joinService.findJoinInGroup({ _id: joinId });
      if (!reqJoin) return next(new HttpError(`JOIN_NOT_FOUND`, 404));

      const { userId, groupId } = reqJoin;

      const user = await this.userService.getUser(userId);
      if (!user) return next(new HttpError('USER_NOT_FOUND', 404));
      if (user.ongoingGroup.length === 4)
        return next(new HttpError('ONGOINGGROUP_EXIST_4', 400));

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

      await this.joinService.deleteOne(joinId);

      const group = await this.groupService.findOneGroup(groupId);
      if (!group) return next(new HttpError('GROUP_NOT_FOUND', 404));
      const currentMembers = group.currentMembers.length;
      const maxMembers = group.maxMembers;

      if (currentMembers === maxMembers) {
        const updatedGroupData = { status: false };
        await this.groupService.updateGroup(groupId, updatedGroupData);
      }

      res.status(204).json();
    } catch (err) {
      console.log(err);
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

      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 진행 그룹
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
      const getData = foundUser.ongoingGroup;

      res.status(200).json({ data: getData, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 관심 그룹
  getWishGroupList = async (
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
      const foundUser = await this.userService.findWishGroupList(userId);
      if (!foundUser) return next(new HttpError(`USER_NOT_FOUND`, 404));

      const wishList = foundUser.wishList;
      res.json({ data: wishList, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 생성 그룹
  getCreatedGroupList = async (
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
      const foundUser = await this.userService.CreatedGroupList(userId);
      if (!foundUser) return next(new HttpError(`USER_NOT_FOUND`, 404));

      const createdGroup = foundUser.createdGroup;
      res.json({ data: createdGroup, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 지원 그룹
  getJoinGroupList = async (
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
      const foundUser = await this.userService.JoinGroupList(userId);
      if (!foundUser) return next(new HttpError(`USER_NOT_FOUND`, 404));

      const joinRequestGroup = foundUser.joinRequestGroup;
      res.json({ data: joinRequestGroup, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 관심 그룹 등록
  patchWishlist = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    try {
      if (!req.user) {
        return next(new HttpError('USER_NOT_FOUND', 404));
      }
      const userTokenInfo = req.user as reqUserInfo;
      const userId: string = userTokenInfo.userId;

      const user = await this.userService.getUser(userId);

      const updatedUserData = { $addToSet: { wishList: groupId } };
      await this.userService.updateUser(userId, updatedUserData);

      const updatedGroupData = { $inc: { wishCount: 1 } };
      await this.groupService.updateGroup(groupId, updatedGroupData);

      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 관심 그룹 해제
  deleteOneWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { groupId } = req.params;
    try {
      if (!req.user) {
        return next(new HttpError('USER_NOT_FOUND', 404));
      }
      const userTokenInfo = req.user as reqUserInfo;
      const userId: string = userTokenInfo.userId;

      const updatedUserData = { $pull: { wishList: groupId } };
      await this.userService.updateUser(userId, updatedUserData);

      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 그룹 종료
  patchEndGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    try {
      if (!req.user) {
        return next(new HttpError('USER_NOT_FOUND', 404));
      }
      const userTokenInfo = req.user as reqUserInfo;
      const userId: string = userTokenInfo.userId;

      const updatedGroupData = { status: '종료' };
      await this.groupService.updateGroup(userId, updatedGroupData);

      const updatedUserData = { createdGroup: null };
      await this.userService.updateUser(userId, updatedUserData);

      await this.groupService.updateMany(groupId);

      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };
  patchChangeStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const groupId = req.params.groupId;
    try {
      const updatedGroupData = { status: false };
      await this.groupService.updateGroup(groupId, updatedGroupData);

      res.json({ data: null, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  deleteAllJoinReqList = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const groupId = req.params.groupId;
    try {
      const updatedGroupData = { joinReqList: [] };
      await this.groupService.updateGroup(groupId, updatedGroupData);

      await this.joinService.deleteManyByGroupId(groupId);

      // User -> joinRequestGroup 에서 지원삭제된 부분 삭제
      const updatedUser = { joinReqGroup: { $in: groupId } };

      res.status(204).json();
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 지원 취소 (User 입장)
  cancelJoinReq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userTokenInfo = req.user as reqUserInfo;
      const userId: string = userTokenInfo.userId;
      const { groupId } = req.params;

      const condition = {
        $and: [{ userId: userId }, { groupId: groupId }],
      };

      const foundJoin = await this.joinService.findOneJoinByCondition(
        condition,
      );

      const updateGroupData = { $pull: { joinReqList: foundJoin?._id } };
      await this.groupService.updateGroup(groupId, updateGroupData);

      const updateUserData = { $pull: { joinRequestGroup: groupId } };
      await this.userService.updateUser(userId, updateUserData);

      await this.joinService.deleteOne(foundJoin?._id);

      res.json({ data: null, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  // 지원 전체 취소 (임시)
  cancelAllJoinReq = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userTokenInfo = req.user as reqUserInfo;
      const userId: string = userTokenInfo.userId;

      res.json({ data: null, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };

  deleteAllJoinReq2List = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.json({ data: null, error: null });
    } catch (err) {
      const error = new HttpError('서버 에러 발생', 500);
      return next(error);
    }
  };
}

export default GroupController;
