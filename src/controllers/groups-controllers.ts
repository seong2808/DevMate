import { Response, Request } from 'express';
import { AuthRequest } from '../types/auth-request';
import User from '../models/User';
import Group from '../models/Group';
import { IGroup } from '../types/groups-types';

const TEMP_USER_ID = '64dc65801ded8e6a83b9d760';

export const getAllGroups = async (req: Request, res: Response) => {
  const tempUser = await User.find();
  try {
    const groups = await Group.find()
      .populate('author', 'nickName')
      .populate('currentMembers', 'nickName')
      .sort({ createdAt: -1 });

    res.json({ data: groups, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('author', 'nickName')
      .populate('currentMembers', 'nickName');
    if (!group) {
      return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
    }

    res.json({ data: group, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

export const postGroup = async (req: Request, res: Response) => {
  try {
    const groupData = {
      ...req.body,
      position: JSON.parse(req.body.position),
      author: TEMP_USER_ID,
      currentMembers: [TEMP_USER_ID],
      imageUrl: req.file ? req.file.path : '',
    };
    const newGroup = new Group(groupData);
    await newGroup.save();
    res.json({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};

export const patchGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const updatedData = { ...req.body };
    const currentGroup = await Group.findById(groupId);
    if (!currentGroup)
      return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });

    if (
      updatedData.maxMembers &&
      updatedData.maxMembers < currentGroup.currentMembers.length
    ) {
      return res
        .status(422)
        .json({ data: null, error: 'MAX_MEMBERS_EXCEEDED' });
    }

    await Group.findByIdAndUpdate(groupId, updatedData, {
      new: true,
    });
    return res.json({ data: null, error: null });
  } catch (err) {
    return res.status(500).json({ data: null, error: `요청 실패 ${err}` });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByIdAndRemove(groupId);
    if (!group) {
      return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
    }

    res.json({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};



