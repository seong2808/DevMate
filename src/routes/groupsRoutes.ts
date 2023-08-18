import { Router } from 'express';
import {
  getAllGroups,
  getGroup,
  postGroup,
  patchGroup,
  deleteGroup,
} from '../controllers/groupsControllers';
import { handleGroupVisit } from '../middlewares/group.handler';
import upload from '../middlewares/uploadFile.handler';
import { handleDtoValidate } from '../middlewares/validateDto.handler';

const router = Router();

router.get('/', handleGroupVisit, getAllGroups);

router.get('/:groupId', handleGroupVisit, getGroup);

router.post('/', upload.single('imageFile'), handleDtoValidate, postGroup);

router.patch('/:groupId', upload.single('imageFile'), patchGroup);

router.delete('/:groupId', deleteGroup);

export default router;
