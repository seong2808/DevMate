import { Schema } from 'mongoose';

export interface IGroup {
  title: string;
  author: typeof Schema.Types.ObjectId;
  type: GroupType;
  description: string;
  location: Location;
  currentMembers: (typeof Schema.Types.ObjectId)[];
  completedDate?: Date;
  position?: Position[];
  imageUrl?: string;
  dueDate?: string;
  skills?: Skill[];
  maxMembers: number;
  viewCount?: number;
  wishCount?: number;
  status: boolean;
  joinReqList: (typeof Schema.Types.ObjectId)[];
  date: string;
}

export interface SortCriteria {
  createdAt?: number;
  viewCount?: number;
}

export type Skill =
  | 'Adobe'
  | 'Android'
  | 'Angular'
  | 'Apache'
  | 'Aws'
  | 'Ec2'
  | 'Babel'
  | 'BootStrap'
  | 'Cpp'
  | 'C#'
  | 'Css'
  | 'Diango'
  | 'Docker'
  | 'Electron'
  | 'Eslint'
  | 'Figma'
  | 'Firebase'
  | 'Flask'
  | 'Flutter'
  | 'Gatsby'
  | 'Git'
  | 'Github'
  | 'Gitlab'
  | 'Go'
  | 'GoogleAnalytics'
  | 'Graphql'
  | 'Heroku'
  | 'Html'
  | 'Illustrator'
  | 'Insomnia'
  | 'Java'
  | 'JavaScript'
  | 'Jest'
  | 'Jira'
  | 'Jquery'
  | 'Kotlin'
  | 'Kubernetes'
  | 'Laravel'
  | 'Linux'
  | 'MongoDb'
  | 'Mui'
  | 'MySql'
  | 'Nest'
  | 'Netlify'
  | 'Next'
  | 'NodeJs'
  | 'Npm'
  | 'OAuth'
  | 'OpenAi'
  | 'Oracle'
  | 'Photoshop'
  | 'Php'
  | 'PostgreSql'
  | 'Postman'
  | 'prettier'
  | 'Prisma'
  | 'Pug'
  | 'Pwa'
  | 'Python'
  | 'Rails'
  | 'React'
  | 'ReactQuery'
  | 'Redis'
  | 'Redux'
  | 'Ruby'
  | 'Rust'
  | 'Scss'
  | 'Spring'
  | 'Svelte'
  | 'Swift'
  | 'Tailwind'
  | 'TypeScript'
  | 'Vim'
  | 'Vite'
  | 'VsCode'
  | 'Vue'
  | 'Webpack'
  | 'Wordpress'
  | 'Xd';

export type Location =
  | '전국'
  | '서울'
  | '부산'
  | '대구'
  | '인천'
  | '광주'
  | '대전'
  | '울산'
  | '강원'
  | '경기'
  | '경남'
  | '경북'
  | '전남'
  | '전북'
  | '충남'
  | '충북'
  | '제주';

export type Position =
  | '프론트엔드'
  | '백엔드'
  | '디자이너'
  | '기획자'
  | '마케팅'
  | 'PM'
  | '퍼블리셔'
  | '풀스택'
  | 'QA'
  | '전체';

export type GroupType = 'study' | 'project';
