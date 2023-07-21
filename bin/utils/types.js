"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isActionFunction = exports.isEnum = exports.isEntity = exports.isType = void 0;
const cds_types_1 = require("./cds.types");
function isType(definition) {
    if (definition == undefined)
        return false;
    return (definition.kind === cds_types_1.Kind.Type &&
        (definition.type !== undefined ||
            definition.elements !== undefined) &&
        definition.isArray !== undefined);
}
exports.isType = isType;
function isEntity(definition) {
    if (definition == undefined)
        return false;
    return (definition.kind === cds_types_1.Kind.Entity ||
        (definition.kind === cds_types_1.Kind.Type &&
            definition.enum === undefined));
}
exports.isEntity = isEntity;
function isEnum(definition) {
    if (definition == undefined)
        return false;
    return (definition.kind === cds_types_1.Kind.Type &&
        definition.enum !== undefined);
}
exports.isEnum = isEnum;
function isActionFunction(definition) {
    if (definition == undefined)
        return false;
    return definition.kind === cds_types_1.Kind.Function || definition.kind === cds_types_1.Kind.Action;
}
exports.isActionFunction = isActionFunction;
