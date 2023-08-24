"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const local_1 = __importDefault(require("./strategies/local"));
const jwt_1 = __importDefault(require("./strategies/jwt"));
exports.default = () => {
    passport_1.default.use('local', local_1.default);
    passport_1.default.use('jwt', jwt_1.default);
};
