"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGroupVisit = void 0;
const Group_1 = __importDefault(require("../models/Group"));
const handleGroupVisit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const visitedGroups = req.cookies.visitedGroups || [];
        if (!visitedGroups.includes(groupId)) {
            // 그룹의 조회수 증가
            yield Group_1.default.findByIdAndUpdate(groupId, { $inc: { viewCount: 1 } });
            // 쿠키에 그룹 ID 추가
            res.cookie('visitedGroups', [...visitedGroups, groupId], {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
        }
        next();
    }
    catch (err) {
        res.status(500).send({ data: null, error: `미들웨어 에러: ${err}` });
    }
});
exports.handleGroupVisit = handleGroupVisit;
