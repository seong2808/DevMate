import mongoose from 'mongoose';
import Join, { IJoin } from '../models/Join';
import User from '../models/User';
import { join } from 'path';

class JoinService {
  async deleteManyByGroupId(groupId: string) {
    await Join.deleteMany({ groupId: { $in: groupId } });
    return;
  }

  async deleteManyByUserId(userId: string) {
    await Join.deleteMany({ userId: userId });
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

  async oqweqweGroup() {
    return {};
  }
}

export default JoinService;
