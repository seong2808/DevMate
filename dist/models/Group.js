"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const groupSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // 그룹 생성하는 사람
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    currentMembers: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
        required: true,
    },
    type: {
        type: String,
        enum: ['study', 'project'],
        required: true,
    },
    position: [
        {
            type: String,
            enum: [
                '프론트엔드',
                '백엔드',
                '디자이너',
                '기획자',
                '마케팅',
                'PM',
                '퍼블리셔',
                '풀스택',
                'QA',
                '전체',
            ],
            required: true,
        },
    ],
    location: {
        type: String,
        enum: [
            '전국',
            '서울',
            '부산',
            '대구',
            '인천',
            '광주',
            '대전',
            '울산',
            '강원',
            '경기',
            '경남',
            '경북',
            '전남',
            '전북',
            '충남',
            '충북',
            '제주',
        ],
        required: true,
    },
    imageUrl: {
        type: String,
        default: '',
    },
    dueDate: { type: String },
    completedDate: { type: Date },
    skills: [
        {
            type: String,
            enum: [
                'Adobe',
                'Android',
                'Angular',
                'Apache',
                'Aws',
                'Ec2',
                'Babel',
                'BootStrap',
                'Cpp',
                'C#',
                'Css',
                'Diango',
                'Docker',
                'Electron',
                'Eslint',
                'Figma',
                'Firebase',
                'Flask',
                'Flutter',
                'Gatsby',
                'Git',
                'Github',
                'Gitlab',
                'Go',
                'GoogleAnalytics',
                'Graphql',
                'Heroku',
                'Html',
                'Illustrator',
                'Insomnia',
                'Java',
                'JavaScript',
                'Jest',
                'Jira',
                'Jquery',
                'Kotlin',
                'Kubernetes',
                'Laravel',
                'Linux',
                'MongoDb',
                'Mui',
                'MySql',
                'Nest',
                'Netlify',
                'Next',
                'NodeJs',
                'Npm',
                'OAuth',
                'OpenAi',
                'Oracle',
                'Photoshop',
                'Php',
                'PostgreSql',
                'Postman',
                'prettier',
                'Prisma',
                'Pug',
                'Pwa',
                'Python',
                'Rails',
                'React',
                'ReactQuery',
                'Redis',
                'Redux',
                'Ruby',
                'Rust',
                'Scss',
                'Spring',
                'Svelte',
                'Swift',
                'Tailwind',
                'TypeScript',
                'Vim',
                'Vite',
                'VsCode',
                'Vue',
                'Webpack',
                'Wordpress',
                'Xd',
            ],
            required: true,
        },
    ],
    maxMembers: { type: Number },
    viewCount: {
        type: Number,
        default: 0,
    },
    wishCount: {
        type: Number,
        default: 0,
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
    },
    // 신청 스키마 _id List
    joinReqList: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Join' }],
    },
}, {
    timestamps: {
        createdAt: true,
        updatedAt: true,
    },
    strict: 'throw',
});
const Group = mongoose_1.default.model('Group', groupSchema);
exports.default = Group;
