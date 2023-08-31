import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { GroupType, Location, Position, Skill } from '../../types/groups-types';
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
  type: GroupType;

  @IsNotEmpty()
  location: Location;

  @IsOptional()
  @IsString()
  dueDate: string;

  // maxMembers => 제한이 있는가?
  @Type(() => Number)
  @IsNumber()
  maxMembers: number;
}
