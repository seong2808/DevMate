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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDtoValidate = void 0;
const groups_dto_1 = require("./dto/groups.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const TEMP_USER_ID = '64dc65801ded8e6a83b9d760';
const handleDtoValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const createGruopDto = (0, class_transformer_1.plainToClass)(groups_dto_1.CreateGroupDto, req.body);
    yield (0, class_validator_1.validate)(createGruopDto).then((errors) => {
        if (errors.length > 0) {
            console.error(errors);
            res.status(500).send({ data: null, error: `요청 실패 ${errors}` });
        }
        else {
            console.log('Validation passed');
        }
    });
    req.body = createGruopDto;
    next();
});
exports.handleDtoValidate = handleDtoValidate;
