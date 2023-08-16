import { Request, Response } from 'express';
import Group from '../models/Group';

export const postGroup = async (req: Request, res: Response) => {
  try {
    const groupData = {
      title: req.body.title,
      type: req.body.type,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      location: req.body.location,
      skills: req.body.skills,
      author: req.body.author,
      currentMembers: [req.body.userId],
      maxMembers: req.body.maxMembers,
      dueDate: req.body.dueDate,
    };

    const newGroup = new Group(groupData);
    await newGroup.save();
    res.json({ data: null, error: null });
  } catch (err) {
    res.status(500).send({ data: null, error: `요청 실패 ${err}` });
  }
};
