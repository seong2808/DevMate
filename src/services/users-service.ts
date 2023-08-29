import mongoose from 'mongoose';
import User from '../models/User';
import { IUser } from '../types/users-types';
import { IJoin } from '../models/Join';
import { group } from 'console';

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
    userId: string | typeof mongoose.Schema.Types.ObjectId,
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

  async deleteJoinInUser(groupIdInJoins: IJoin[], groupId: string) {
    return;
  }
}

export default UserService;
