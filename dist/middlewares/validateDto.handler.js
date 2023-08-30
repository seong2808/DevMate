"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDtoValidate = void 0;
const groups_dto_1 = require("./dto/groups.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const TEMP_USER_ID = '64dc65801ded8e6a83b9d760';
const handleDtoValidate = async (req, res, next) => {
    const createGruopDto = (0, class_transformer_1.plainToClass)(groups_dto_1.CreateGroupDto, req.body);
    await (0, class_validator_1.validate)(createGruopDto).then((errors) => {
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
};
exports.handleDtoValidate = handleDtoValidate;
