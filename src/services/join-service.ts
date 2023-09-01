import mongoose from 'mongoose';
import Join, { IJoin } from '../models/Join';
import Notification from '../models/Notification';
import { IGroup } from '../types/groups-types';

class JoinService {
  async deleteManyByGroupId(groupId: string) {
    await Join.deleteMany({ groupId: { $in: groupId } });
    return;
  }

  async deleteManyByUserId(userId: string) {
    const join = await Join.deleteMany({ userId: userId });
    return join;
  }

  async createJoin(
    userId: string,
    groupId: string,
    content: string,
    date: string,
  ) {
    const newJoin = new Join({ userId, groupId, content, date });
    const join = await newJoin.save();
    return join;
  }

  async findOneJoin(joinId: string | object) {
    const join = await Join.findById(joinId);
    return join;
  }

  async findJoinInGroup(joinId: string | object) {
    const join = await Join.findById(joinId).populate('groupId');
    return join;
  }

  async deleteOne(joinId: string | object) {
    const deletedJoin = await Join.findByIdAndDelete({ _id: joinId });
    return deletedJoin;
  }

  async findByGroupId(groupId: string): Promise<IJoin[]> {
    const join = await Join.find({ groupId: groupId });
    return join;
  }

  async findByUserId(userId: string): Promise<IJoin[]> {
    const join = await Join.find({ userId: userId });
    return join;
  }

  async findOneJoinByCondition(condition: object) {
    const foundJoin = await Join.findOne(condition);
    return foundJoin;
  }

  async deleteByUserId(userId: string) {
    const deletedJoins = await Join.deleteMany({ userId: userId });
    return deletedJoins;
  }

  async deleteByJoinReqList(
    group: mongoose.Document<unknown, {}, IGroup> &
      IGroup & {
        _id: mongoose.Types.ObjectId;
      },
    userId: string,
  ) {
    const joinReqList = group.joinReqList;
    const saveJoinDate: object[] = [];
    await Promise.allSettled(
      joinReqList.map(async (joinUserId) => {
        const join = await Join.findByIdAndDelete({ _id: joinUserId });
        if (join) {
          const notificationData = {
            receiverId: joinUserId,
            senderId: userId,
            groupId: group._id,
            content: `${group.title} 그룹 가입 신청이 거절되었습니다.`,
            type: group.type,
            kind: 'reject',
          };

          const notification = new Notification(notificationData);
          const newNotification = await notification.save();
        }
      }),
    );
    return {};
  }
}

export default JoinService;
