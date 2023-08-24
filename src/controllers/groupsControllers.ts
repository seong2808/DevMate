import { Response, Request } from 'express';
import { AuthRequest } from '../types/auth-request';
import User from '../models/User';
import Group from '../models/Group';
import Join from '../models/Join';
import { SortCriteria } from '../types/groups-types';
import Notification from '../models/Notification';

const TEMP_USER_ID = '64dc65801ded8e6a83b9d760';

// 전체 그룹 조회
export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const type = req.query.type;
    const location = req.query.location;
    const sortByTime = req.query.sortByTime === 'false' ? false : true || true;

    const page = Number(req.query.page);
    const perPage = Number(req.query.perPage) || 8;

    const position = req.query.position as string;
    const newPosition = position?.split(',');

    const skill = req.query.skills as string;
    const newSkill = skill?.split(',');

    const sortCriteria: SortCriteria = {};
    sortByTime ? (sortCriteria.createdAt = -1) : (sortCriteria.viewCount = -1);

    const groups = await Group.find(
      newPosition || location || newSkill || type
        ? {
            $and: [
              newPosition ? { position: { $in: newPosition } } : {},
              location ? { location: location } : {},
              newSkill ? { skills: { $in: newSkill } } : {},
              type ? { type: type } : {},
            ],
          }
        : {},
    )
      .sort(sortByTime ? { createdAt: -1 } : { viewCount: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage);

    const data = await Group.find(
      newPosition || location || newSkill || type
        ? {
            $and: [
              newPosition ? { position: { $in: newPosition } } : {},
              location ? { location: location } : {},
              newSkill ? { skills: { $in: newSkill } } : {},
              type ? { type: type } : {},
            ],
          }
        : {},
    );
    const total = data.length;
    const totalPage = Math.ceil(total / perPage);

    res.json({
      data: {
        groups,
        totalPage,
      },
      error: null,
    });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

// 상위 4개 그룹 조회
export const getHotGroups = async (req: Request, res: Response) => {
  try {
    const getData = await Group.find().sort({ viewCount: -1 }).limit(4);
    if (!getData)
      return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });

    res.json({ data: getData, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

// 그룹 상세 조회(조회수 추가)
export const getGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('author', 'nickName')
      .populate('currentMembers', 'nickName');
    if (!group) {
      return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
    }

    res.json({ data: group, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

// 그룹 생성
export const postGroup = async (req: Request, res: Response) => {
  try {
    const createGruopDto = req.body;

    // if (!req.user) {
    //   return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
    // }
    // const userTokenInfo = req.user as reqUserInfo;
    // const userId: string = userTokenInfo.userId;

    const groupData = {
      ...createGruopDto,
      position: JSON.parse(req.body.position),
      skills: JSON.parse(req.body.skills),
      author: TEMP_USER_ID,
      currentMembers: [TEMP_USER_ID],
      imageUrl: req.file ? req.file.path : '',
    };

    const newGroup = new Group(groupData);
    await newGroup.save();
    res.json({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

//그룹 수정
export const patchGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const updatedData = { ...req.body };
    const currentGroup = await Group.findById(groupId);
    if (!currentGroup)
      return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });

    if (
      updatedData.maxMembers &&
      updatedData.maxMembers < currentGroup.currentMembers.length
    ) {
      return res
        .status(422)
        .json({ data: null, error: 'MAX_MEMBERS_EXCEEDED' });
    }

    await Group.findByIdAndUpdate(groupId, updatedData, {
      new: true,
    });
    return res.json({ data: null, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: `요청 실패 ${err}` });
  }
};

// 그룹 삭제
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByIdAndRemove(groupId);
    // if (!group) {
    //   return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
    // }

    await Join.deleteMany({ groupId });

    await User.findOneAndUpdate(
      { groups: { $in: groupId } },
      {
        $pull: { groups: groupId },
      },
      { new: true },
    );

    res.json({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

// 그룹 참여 요청
export const joinReqGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId, content } = req.body;
    const newJoin = new Join({ userId, groupId, content });

    const saveJoin = await newJoin.save();

    const currentGroup = await Group.findById(groupId);

    if (!currentGroup)
      return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });

    await Group.findByIdAndUpdate(
      groupId,
      { $push: { joinReqList: saveJoin._id } },
      {
        new: true,
      },
    );

    const createdNotification = new Notification({
      receiverId: currentGroup.author,
      senderId: userId,
      groupId: groupId,
      type: currentGroup.type,
      kind: 'join',
      status: true,
    });

    res.json({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

// 그룹 참여 신청 리스트
export const getGroupJoinList = async (req: Request, res: Response) => {
  try {
    const getData: object[] = [];

    const { groupId } = req.params;
    const getGroupJoinList = await Group.findById(groupId);
    const joinReqList = getGroupJoinList?.joinReqList ?? [];

    const page = Number(req.query.page);
    const perPage = Number(req.query.perPage);
    const total = joinReqList.length;
    const totalPage = Math.ceil(total / perPage);

    if (!joinReqList)
      return res.status(404).json({ data: null, error: 'JOINLIST_NOT_FOUND' });

    let limit = 0;

    for (let i = (page - 1) * perPage; i < total; i++) {
      if (limit === perPage) break;

      const joinReq = await Join.findById(joinReqList[i]);
      const user = await User.findById(joinReq?.userId);
      if (!joinReq || !user) continue;
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
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

// 그룹 신청 승인
export const approveGroupJoinRequest = async (req: Request, res: Response) => {
  try {
    const { joinId } = req.params;

    const reqJoin = await Join.findById({ _id: joinId });

    if (!reqJoin)
      return res.status(404).send({ data: null, error: `JOIN_NOT_FOUND` });

    const { groupId, userId } = reqJoin;

    // 그룹에 현재 멤버 업데이트
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $addToSet: { currentMembers: userId },
        $pull: { joinReqList: joinId },
      },
      { new: true },
    );

    // 유저에 속해 있는 그룹 업데이트
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { groups: groupId } },
      { new: true },
    );

    //해당 Join 삭제
    const deletedJoin = await Join.deleteOne({ _id: joinId });

    res.status(204).send();
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

// 그룹 신청 거절
export const rejectGroupJoinRequest = async (req: Request, res: Response) => {
  try {
    const { joinId } = req.params;

    const reqJoin = await Join.findById({ _id: joinId });

    if (!reqJoin)
      return res.status(404).send({ data: null, error: `JOIN_NOT_FOUND` });

    const { groupId } = reqJoin;

    // 그룹에 현재 멤버 업데이트
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: { joinReqList: joinId },
      },
      { new: true },
    );

    const deletedJoin = await Join.deleteOne({ _id: joinId });

    res.status(204).send();
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

// 현재 진행
export const ongoingGroupList = async (req: Request, res: Response) => {
  try {
    // 토큰에서 user 고유 Id 가져오는 코드
    // if (!req.user) {
    //   return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
    // }
    // const userTokenInfo = req.user as reqUserInfo;
    // const userId: string = userTokenInfo.userId;

    res.status(200).send({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};
//찜한
export const wishlistGroupList = async (req: Request, res: Response) => {
  try {
    // 토큰에서 user 고유 Id 가져오는 코드
    // if (!req.user) {
    //   return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
    // }
    // const userTokenInfo = req.user as reqUserInfo;
    // const userId: string = userTokenInfo.userId;

    res.status(200).send({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};
//생성한
export const createdGroupList = async (req: Request, res: Response) => {
  try {
    // 토큰에서 user 고유 Id 가져오는 코드
    // if (!req.user) {
    //   return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
    // }
    // const userTokenInfo = req.user as reqUserInfo;
    // const userId: string = userTokenInfo.userId;

    res.status(200).send({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};
//지원한
export const joinGroupList = async (req: Request, res: Response) => {
  try {
    // 토큰에서 user 고유 Id 가져오는 코드
    // if (!req.user) {
    //   return res.status(404).json({ data: null, error: 'USER_NOT_FOUND' });
    // }
    // const userTokenInfo = req.user as reqUserInfo;
    // const userId: string = userTokenInfo.userId;

    res.status(200).send({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};
