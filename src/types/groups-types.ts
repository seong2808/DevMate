import { Schema } from 'mongoose';

export interface IGroup {
  title: string;
  author: typeof Schema.Types.ObjectId;
  type: GroupTypes;
  description: string;
  location: Locations;
  currentMembers: (typeof Schema.Types.ObjectId)[];
  completedDate?: Date;
  position?: GroupPositions[];
  imageUrl?: string;
  dueDate?: string;
  skills?: string[];
  maxMembers?: number;
  viewCount?: number;
  wishCount?: number;
  status?: GroupStatus;
}

export enum GroupTypes {
  스터디 = '스터디',
  프로젝트 = '프로젝트',
}

export enum GroupPositions {
  프론트엔드 = '프론트엔드',
  백엔드 = '백엔드',
  디자이너 = '디자이너',
  기획자 = '기획자',
}

export enum GroupStatus {
  모집중 = '모집중',
  진행중 = '진행중',
  완료 = '완료',
}

export enum Locations {
  전국 = '전국',
  서울 = '서울',
  세종 = '세종',
  강원 = '강원',
  인천 = '인천',
  경기 = '경기',
  충북 = '충북',
  충남 = '충남',
  경북 = '경북',
  경남 = '경남',
  대전 = '대전',
  대구 = '대구',
  전북 = '전북',
  전남 = '전남',
  울산 = '울산',
  광주 = '광주',
  부산 = '부산',
  제주 = '제주'
}