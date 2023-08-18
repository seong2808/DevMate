import { IsEnum, IsNotEmpty, IsNumber, IsString, max } from 'class-validator';
import { GroupTypes, Locations, GroupPositions } from '../types/groups-types';
import { Transform, Type } from 'class-transformer';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  @Transform((value) => value.value.trim())
  title: string;

  @IsNotEmpty()
  @IsString()
  @Transform((value) => value.value.trim())
  description: string;

  @IsNotEmpty()
  @IsEnum(GroupTypes, { message: '해당하지 않는다' })
  type: GroupTypes;

  @IsNotEmpty()
  @IsEnum(Locations, { each: true })
  position: GroupPositions[];

  @IsNotEmpty()
  @IsEnum(Locations)
  location: Locations;

  @IsString()
  dueDate?: string;

  @IsString({ each: true })
  skills?: string[];

  // maxMembers => 제한이 있는가?
  @Type(() => Number)
  @IsNumber()
  maxMembers?: number;
}
