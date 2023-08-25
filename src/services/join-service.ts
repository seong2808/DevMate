import Join from '../models/Join';

class JoinService {
  async deleteManyJoin(groupId: string) {
    await Join.deleteMany({ groupId: { $in: groupId } });

    return;
  }

  async createJoin(userId: string, groupId: string, content: string) {
    const newJoin = new Join({ userId, groupId, content });
    const join = await newJoin.save();
    return join;
  }

  async oqweqweGroup() {
    return {};
  }
}

export default JoinService;
