"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const groups_routes_1 = __importDefault(require("./routes/groups-routes"));
const body_parser_1 = __importDefault(require("body-parser"));
const users_routes_1 = __importDefault(require("./routes/users-routes"));
const passport_1 = __importDefault(require("passport"));
const passport_2 = __importDefault(require("./passport"));
const get_token_handler_1 = __importDefault(require("./middlewares/get-token.handler"));
const error_handler_1 = require("./middlewares/error.handler");
(0, passport_2.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
app.use(passport_1.default.initialize());
app.use(get_token_handler_1.default);
app.use('/api/groups', groups_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/uploads', express_1.default.static('uploads'));
app.use(error_handler_1.errorHandler);
const initServer = async () => {
    try {
        const MONGO_DB = process.env.MONGO_DB;
        if (!MONGO_DB) {
            throw new Error('MONGO_DB environment variable is not set.');
        }
        await mongoose_1.default.connect(MONGO_DB);
        console.log('DB 연결 완료');
        const PORT = process.env.PORT;
        app.listen(PORT, () => {
            console.log(`서버 실행, 포트 : ${PORT}`);
        });
    }
    catch (err) {
        console.error('Mongoose error:', err);
        process.exit(1);
    }
};
initServer();
