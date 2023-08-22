import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  max,
} from 'class-validator';
import { GroupType, Location, Position, Skill } from '../types/groups-types';
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

  // @IsNotEmpty()
  // @IsEnum(
  //   [
  //     '프론트엔드',
  //     '백엔드',
  //     '디자이너',
  //     '기획자',
  //     '마케팅',
  //     'PM',
  //     '퍼블리셔',
  //     '풀스택',
  //     'QA',
  //     '전체',
  //   ],
  //   { each: true },
  // )
  // position: Position[];

  @IsNotEmpty()
  location: Location;

  @IsOptional()
  @IsString()
  dueDate: string;

  // @IsOptional()
  // @IsNotEmpty()
  // @IsEnum(
  //   [
  //     'Adobe',
  //     'Android',
  //     'Angular',
  //     'Apache',
  //     'Aws',
  //     'Ec2',
  //     'Babel',
  //     'BootStrap',
  //     'Cpp',
  //     'C#',
  //     'Css',
  //     'Diango',
  //     'Docker',
  //     'Electron',
  //     'Eslint',
  //     'Figma',
  //     'Firebase',
  //     'Flask',
  //     'Flutter',
  //     'Gatsby',
  //     'Git',
  //     'Github',
  //     'Gitlab',
  //     'Go',
  //     'GoogleAnalytics',
  //     'Graphql',
  //     'Heroku',
  //     'Html',
  //     'Illustrator',
  //     'Insomnia',
  //     'Java',
  //     'JavaScript',
  //     'Jest',
  //     'Jira',
  //     'Jquery',
  //     'Kotlin',
  //     'Kubernetes',
  //     'Laravel',
  //     'Linux',
  //     'MongoDb',
  //     'Mui',
  //     'MySql',
  //     'Nest',
  //     'Netlify',
  //     'Next',
  //     'NodeJs',
  //     'Npm',
  //     'OAuth',
  //     'OpenAi',
  //     'Oracle',
  //     'Photoshop',
  //     'Php',
  //     'PostgreSql',
  //     'Postman',
  //     'prettier',
  //     'Prisma',
  //     'Pug',
  //     'Pwa',
  //     'Python',
  //     'Rails',
  //     'React',
  //     'ReactQuery',
  //     'Redis',
  //     'Redux',
  //     'Ruby',
  //     'Rust',
  //     'Scss',
  //     'Spring',
  //     'Svelte',
  //     'Swift',
  //     'Tailwind',
  //     'TypeScript',
  //     'Vim',
  //     'Vite',
  //     'VsCode',
  //     'Vue',
  //     'Webpack',
  //     'Wordpress',
  //     'Xd',
  //   ],
  //   { each: true },
  // )
  // skills: Skill[];

  // maxMembers => 제한이 있는가?
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxMembers: number;
}
