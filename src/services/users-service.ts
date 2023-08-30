import mongoose from 'mongoose';
import User from '../models/User';
import { IUser } from '../types/users-types';
import { IGroup } from '../types/groups-types';
import Notification from '../models/Notification';

class UserService {
  // 전체 정보 조회
  async getAllUsers() {
    const allUsers = await User.find();
    return allUsers;
  }
  // 내 정보 조회
  async getMyInfo(userId: string) {
    const foundUser = await User.findById(userId, '-password');
    return foundUser;
  }
  // 다른 사람 정보 조회
  async getUser(userId: string | typeof mongoose.Schema.Types.ObjectId) {
    const foundUser = await User.findById(userId, '-password');
    return foundUser;
  }
  // 이메일로 유저 찾기
  async findUserByEmail(email: string) {
    const foundUser = await User.findOne({ email });
    return foundUser;
  }
  // 유저 업데이트
  async updateUser(
    userId: string | typeof mongoose.Schema.Types.ObjectId | object,
    updates: IUser | object,
  ) {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      select: '-password',
    });
    return updatedUser;
  }
  // 유저 삭제
  async deleteUser(userId: string) {
    await User.findByIdAndDelete(userId);
  }
  // 유저 진행중 그룹 조회
  async findOngoingGroupList(userId: string) {
    const foundUser = await User.findById(userId).populate('ongoingGroup');
    return foundUser;
  }
  // 유저 관심 그룹 조회
  async findWishGroupList(userId: string) {
    const foundUser = await User.findById(userId).populate('wishList');
    return foundUser;
  }
  // 유저 생성 그룹 조회
  async CreatedGroupList(userId: string) {
    const foundUser = await User.findById(userId).populate('createdGroup');
    return foundUser;
  }
  // 유저 그룹 정보 삭제
  async deleteCurrentMemberInGroup(
    group: mongoose.Document<unknown, {}, IGroup> &
      IGroup & {
        _id: mongoose.Types.ObjectId;
      },
    userId: string,
    groupId: string,
  ) {
    const currentMembers = group.currentMembers;
    Promise.allSettled(
      currentMembers.map(async (memberId) => {
        const notificationData = {
          receiverId: memberId,
          senderId: userId,
          groupId: groupId,
          content: `${group.title} 그룹이 삭제되었습니다.`,
          type: group.type,
          kind: 'delete',
        };

        const notification = new Notification(notificationData);
        const newNotification = await notification.save();

        const user = await User.findByIdAndUpdate(memberId, {
          $pull: { ongoingGroup: group._id },
          $push: { notifications: newNotification._id },
        });
      }),
    );

    return;
  }
}

export default UserService;
