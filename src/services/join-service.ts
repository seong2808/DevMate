import mongoose from 'mongoose';
import Join from '../models/Join';

class JoinService {
  async deleteManyByGroupId(groupId: string) {
    await Join.deleteMany({ groupId: { $in: groupId } });
    return;
  }

  async createJoin(userId: string, groupId: string, content: string) {
    const newJoin = new Join({ userId, groupId, content });
    const join = await newJoin.save();
    return join;
  }

  async findOneJoin(joinId: string | object) {
    const join = await Join.findById(joinId);
    return join;
  }

  async deleteOne(joinId: string | object) {
    const deletedJoin = await Join.deleteOne({ _id: joinId });
    return;
  }

  async oqweqweGroup() {
    return {};
  }
}

export default JoinService;
