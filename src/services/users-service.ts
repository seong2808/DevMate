import User from '../models/User';
import { IUser } from '../types/users-types';

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
  async getUser(userId: string) {
    const foundUser = await User.findById(userId, '-password');
    return foundUser;
  }

  async findUserByEmail(email: string) {
    const foundUser = await User.findOne({ email });
    return foundUser;
  }

  async updateUser(userId: string, updates: IUser) {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      select: '-password',
    });
    return updatedUser;
  }

  async deleteUser(userId: string) {
    await User.findByIdAndDelete(userId);
  }
}

export default UserService;
