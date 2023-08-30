"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Group_1 = __importDefault(require("../models/Group"));
const User_1 = __importDefault(require("../models/User"));
class GroupService {
    async findAllGroup(page, perPage, type, location, position, skill, sortByTime) {
        const sortCriteria = {};
        sortByTime ? (sortCriteria.createdAt = -1) : (sortCriteria.viewCount = -1);
        const groups = await Group_1.default.find(position || location || skill || type
            ? {
                $and: [
                    position ? { position: { $in: position } } : {},
                    location ? { location: location } : {},
                    skill ? { skills: { $in: skill } } : {},
                    type ? { type: type } : {},
                    { status: true },
                ],
            }
            : {
                status: true,
            })
            .sort(sortByTime ? { createdAt: -1 } : { viewCount: -1 })
            .skip(perPage * (page - 1))
            .limit(perPage);
        const data = await Group_1.default.find(position || location || skill || type
            ? {
                $and: [
                    position ? { position: { $in: position } } : {},
                    location ? { location: location } : {},
                    skill ? { skills: { $in: skill } } : {},
                    type ? { type: type } : {},
                    { status: true },
                ],
            }
            : {
                status: true,
            });
        const total = data.length;
        const totalPage = Math.ceil(total / perPage);
        return { groups, totalPage };
    }
    async findHotGroup() {
        const hotGroup = await Group_1.default.find().sort({ viewCount: -1 }).limit(4);
        return hotGroup;
    }
    async findOneGroup(groupId) {
        const group = await Group_1.default.findById(groupId)
            .populate('author', 'nickName')
            .populate('currentMembers', 'nickName');
        return group;
    }
    async findJoinReqList(groupId) {
        const group = await Group_1.default.findById(groupId).populate('joinReqList');
        return group;
    }
    async createGroup(userId, groupData) {
        const newGroup = new Group_1.default(groupData);
        const createdGroup = newGroup.save();
        await User_1.default.findByIdAndUpdate(userId, {
            createdGroup: (await createdGroup)._id,
            $push: { ongoingGroup: (await createdGroup)._id },
        }, { new: true });
        return;
    }
    async updateGroup(groupId, updatedData) {
        const updatedGroup = await Group_1.default.findByIdAndUpdate(groupId, updatedData, {
            new: true,
        });
        return updatedGroup;
    }
    async deleteGroup(groupId) {
        await User_1.default.updateMany({ wishList: groupId }, { $pull: { wishList: groupId } });
        await User_1.default.updateMany({ ongoingGroup: groupId }, { $pull: { ongoingGroup: groupId } });
        await User_1.default.updateMany({ joinRequestGroup: groupId }, { $pull: { joinRequestGroup: groupId } });
        await User_1.default.updateMany({ createdGroup: groupId }, { createdGroup: null });
        return;
    }
    async deleteOnlyGroup(groupId) {
        const group = await Group_1.default.findByIdAndRemove(groupId);
        return group;
    }
    async updateMany(groupId) {
        await User_1.default.updateMany({ ongoingGroup: groupId }, {
            $pull: { ongoingGroup: groupId },
            $push: { endGroup: groupId },
        }, { new: true });
        return;
    }
    async GroupinUserPagination(groupIds, groupType, page, perPage, totalData) {
        const groupsInfo = [];
        let limit = 0;
        console.log(groupType);
        for (let i = (page - 1) * perPage; i < totalData; i++) {
            if (limit === perPage)
                break;
            const groupInfo = await Group_1.default.findOne({
                $and: [{ _id: groupIds[i] }, { type: groupType }],
            });
            if (groupInfo)
                groupsInfo.push(groupInfo);
            limit++;
        }
        return groupsInfo;
    }
    async findByJoinIdAndUpdate(condition) {
        const result = await Group_1.default.updateMany({ joinReqList: { $in: condition } }, { $pull: { joinReqList: { $in: condition } } });
        return result;
    }
}
exports.default = GroupService;
