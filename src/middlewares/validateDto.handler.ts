import { NextFunction, Request, Response } from 'express';
import { CreateGroupDto } from './dto/groups.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const handleDtoValidate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const createGruopDto = plainToClass(CreateGroupDto, req.body);
  await validate(createGruopDto).then((errors) => {
    if (errors.length > 0) {
      console.error(errors);
      res.status(500).send({ data: null, error: `요청 실패 ${errors}` });
    } else {
      console.log('Validation passed');
    }
  });

  req.body = createGruopDto;

  next();
};
