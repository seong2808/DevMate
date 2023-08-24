import { NextFunction, Request, Response } from 'express';
import Group from '../models/Group';

export const handleGroupVisit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { groupId } = req.params;
    const visitedGroups = req.cookies.visitedGroups || [];

    if (!visitedGroups.includes(groupId)) {
      // 그룹의 조회수 증가
      await Group.findByIdAndUpdate(groupId, { $inc: { viewCount: 1 } });

      // 쿠키에 그룹 ID 추가
      res.cookie('visitedGroups', [...visitedGroups, groupId], {
        maxAge: 24 * 60 * 60 * 1000, // 쿠키 유효기간을 1일로 설정
        httpOnly: true,
      });
    }

    next();
  } catch (err) {
    res.status(500).send({ data: null, error: `미들웨어 에러: ${err}` });
  }
};
