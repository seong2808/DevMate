import mongoose from 'mongoose';
import Join, { IJoin } from '../models/Join';

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

  async findJoinInGroup(joinId: string | object) {
    const join = await Join.findById(joinId).populate('groupId');
    return join;
  }

  async deleteOne(joinId: string | object) {
    const deletedJoin = await Join.findByIdAndDelete({ _id: joinId });
    return deletedJoin;
  }

  async findOneJoinByCondition(condition: object) {
    const foundJoin = await Join.findOne(condition);
    return foundJoin;
  }

  async oqweqweGroup() {
    return {};
  }
}

export default JoinService;
