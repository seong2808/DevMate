import { Request, Response } from 'express';
import GroupsService from '../services/groups-service';

class GroupController {
  private groupsService: GroupsService;

  constructor(groupsService: GroupsService) {
    this.groupsService = groupsService;
  }

  getAllGroup = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const perPage = Number(req.query.perPage) || 8;

    const type = req.query.type?.toString();
    const location = req.query.location?.toString();
    const position = req.query.position?.toString();
    const skill = req.query.skills?.toString();

    const newPosition = position?.split(',');
    const newSkill = skill?.split(',');
    const sortByTime = req.query.sortByTime === 'false' ? false : true || true;

    try {
      const getGroup = await this.groupsService.allGroup(
        page,
        perPage,
        type,
        location,
        newPosition,
        newSkill,
        sortByTime,
      );
      res.json({ data: { getGroup }, error: null });
    } catch (err) {
      res.status(500).json({ data: null, error: `요청 실패 ${err}` });
    }
  };
}

export default GroupController;
