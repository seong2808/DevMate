import mongoose from 'mongoose';
import User from '../models/User';
import { IUser } from '../types/users-types';
import { IJoin } from '../models/Join';
import { group } from 'console';
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
  //
  async getUser(userId: string | typeof mongoose.Schema.Types.ObjectId) {
    const foundUser = await User.findById(userId, '-password');
    return foundUser;
  }

  async findUserByEmail(email: string) {
    const foundUser = await User.findOne({ email });
    return foundUser;
  }

  async findUserById(userId: string) {
    const foundUser = await User.findById(userId);
    return foundUser;
  }

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

  async deleteUser(userId: string) {
    await User.findByIdAndDelete(userId);
  }

  async findOngoingGroupList(userId: string) {
    const foundUser = await User.findById(userId).populate('ongoingGroup');
    return foundUser;
  }

  async findWishGroupList(userId: string) {
    const foundUser = await User.findById(userId).populate('wishList');
    return foundUser;
  }

  async CreatedGroupList(userId: string) {
    const foundUser = await User.findById(userId).populate('createdGroup');
    return foundUser;
  }

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
