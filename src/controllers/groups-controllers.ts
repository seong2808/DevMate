import { Response, Request } from 'express';
import { AuthRequest } from '../types/auth-request';
import Group from '../models/Group';
import { IGroup } from '../types/groups-types';

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const groups = await Group.find()
      .populate('author', 'name')
      .populate('currentMembers', 'name')
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
      .populate('author', 'name')
      .populate('currentMembers', 'name');
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
      // author: req.user.userId,
      // currentMembers: [req.user.userId],
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
    const updatedData = {
      ...req.body,
    };

    const group = await Group.findByIdAndUpdate(groupId, updatedData, {
      new: true,
    });
    if (!group) {
      return res.status(404).json({ data: null, error: 'GROUP_NOT_FOUND' });
    }

    res.json({ data: group, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
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
