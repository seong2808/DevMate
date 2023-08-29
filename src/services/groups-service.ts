import mongoose from 'mongoose';
import Group from '../models/Group';
import User from '../models/User';
import { SortCriteria } from '../types/groups-types';

class GroupService {
  async findAllGroup(
    page: number,
    perPage: number,
    type: string | undefined,
    location: string | undefined,
    position: string[] | undefined,
    skill: string[] | undefined,
    sortByTime: boolean | undefined,
  ) {
    const sortCriteria: SortCriteria = {};
    sortByTime ? (sortCriteria.createdAt = -1) : (sortCriteria.viewCount = -1);

    const groups = await Group.find(
      position || location || skill || type
        ? {
            $and: [
              position ? { position: { $in: position } } : {},
              location ? { location: location } : {},
              skill ? { skills: { $in: skill } } : {},
              type ? { type: type } : {},
              { status: true },
            ],
          }
        : {
            status: true,
          },
    )
      .sort(sortByTime ? { createdAt: -1 } : { viewCount: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage);

    const data = await Group.find(
      position || location || skill || type
        ? {
            $and: [
              position ? { position: { $in: position } } : {},
              location ? { location: location } : {},
              skill ? { skills: { $in: skill } } : {},
              type ? { type: type } : {},
              { status: true },
            ],
          }
        : {
            status: true,
          },
    );

    const total = data.length;
    const totalPage = Math.ceil(total / perPage);

    return { groups, totalPage };
  }

  async findHotGroup() {
    const hotGroup = await Group.find().sort({ viewCount: -1 }).limit(4);
    return hotGroup;
  }

  async findOneGroup(groupId: string | typeof mongoose.Schema.Types.ObjectId) {
    const group = await Group.findById(groupId)
      .populate('author', 'nickName')
      .populate('currentMembers', 'nickName');
    return group;
  }

  async findJoinReqList(
    groupId: string | typeof mongoose.Schema.Types.ObjectId,
  ) {
    const group = await Group.findById(groupId).populate('joinReqList');
    return group;
  }

  async createGroup(userId: string, groupData: object) {
    const newGroup = new Group(groupData);
    const createdGroup = newGroup.save();

    await User.findByIdAndUpdate(
      userId,
      {
        createdGroup: (await createdGroup)._id,
        $push: { ongoingGroup: (await createdGroup)._id },
      },
      { new: true },
    );
    return;
  }

  async updateGroup(
    groupId: string | typeof mongoose.Schema.Types.ObjectId,
    updatedData: object,
  ) {
    const updatedGroup = await Group.findByIdAndUpdate(groupId, updatedData, {
      new: true,
    });
    return updatedGroup;
  }

  async deleteGroup(groupId: string) {
    await User.updateMany(
      { wishList: groupId },
      { $pull: { wishList: groupId } },
    );
    await User.updateMany(
      { ongoingGroup: groupId },
      { $pull: { ongoingGroup: groupId } },
    );
    await User.updateMany(
      { joinRequestGroup: groupId },
      { $pull: { joinRequestGroup: groupId } },
    );
    await User.updateMany({ createdGroup: groupId }, { createdGroup: null });
    return;
  }

  async deleteOnlyGroup(groupId: string) {
    const group = await Group.findByIdAndRemove(groupId);
    return group;
  }

  async updateMany(groupId: string) {
    await User.updateMany(
      { ongoingGroup: groupId },
      {
        $pull: { ongoingGroup: groupId },
        $push: { endGroup: groupId },
      },
      { new: true },
    );
    return;
  }

  async GroupinUserPagination(
    groupIds: (typeof mongoose.Schema.Types.ObjectId)[],
    groupType: string,
    page: number,
    perPage: number,
    totalData: number,
  ) {
    const groupsInfo: object[] = [];
    let limit = 0;
    console.log(groupType);
    for (let i = (page - 1) * perPage; i < totalData; i++) {
      if (limit === perPage) break;
      const groupInfo = await Group.findOne({
        $and: [{ _id: groupIds[i] }, { type: groupType }],
      });
      if (groupInfo) groupsInfo.push(groupInfo);
      limit++;
    }

    return groupsInfo;
  }

  async findByJoinIdAndUpdate(condition: string[]) {
    const result = await Group.updateMany(
      { joinReqList: { $in: condition } },
      { $pull: { joinReqList: { $in: condition } } },
    );

    return result;
  }
}

export default GroupService;
