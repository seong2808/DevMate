import User from '../models/User';

class UserService {
  static async getUserInfo(userId: string) {
    const foundUser = await User.findById(userId, '-password');
    return foundUser;
  }
}

export default UserService;
