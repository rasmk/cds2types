"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isType = exports.isTypeRef = exports.isReturnsMulti = exports.isReturnsSingle = exports.isFunctionDef = exports.isActionDef = exports.isEnumTypeDef = exports.isStructuredTypeDef = exports.isArrayTypeAliasElementItems = exports.isArrayTypeAliasTypeItems = exports.isArrayTypeAliasDef = exports.isTypeAliasDef = exports.isTypeDef = exports.isEntityDef = exports.isServiceDef = exports.Cardinality = exports.Kind = exports.CommonType = exports.Type = exports.Managed = void 0;
var Managed;
(function (Managed) {
    Managed["CreatedAt"] = "createdAt";
    Managed["CreatedBy"] = "createdBy";
    Managed["ModifiedAt"] = "modifiedAt";
    Managed["ModifiedBy"] = "modifiedBy";
})(Managed = exports.Managed || (exports.Managed = {}));
var Type;
(function (Type) {
    Type["Association"] = "cds.Association";
    Type["Composition"] = "cds.Composition";
    Type["Uuid"] = "cds.UUID";
    Type["Boolean"] = "cds.Boolean";
    Type["Integer"] = "cds.Integer";
    Type["Integer64"] = "cds.Integer64";
    Type["Decimal"] = "cds.Decimal";
    Type["DecimalFloat"] = "cds.DecimalFloat";
    Type["Double"] = "cds.Double";
    Type["Date"] = "cds.Date";
    Type["Time"] = "cds.Time";
    Type["DateTime"] = "cds.DateTime";
    Type["Timestamp"] = "cds.Timestamp";
    Type["String"] = "cds.String";
    Type["Binary"] = "cds.Binary";
    Type["LargeString"] = "cds.LargeString";
    Type["LargeBinary"] = "cds.LargeBinary";
    Type["User"] = "User";
    Type["HanaTinyint"] = "cds.hana.TINYINT";
})(Type = exports.Type || (exports.Type = {}));
var CommonType;
(function (CommonType) {
    CommonType["CodeList"] = "sap.common.CodeList";
    CommonType["Countries"] = "sap.common.Countries";
    CommonType["Currencies"] = "sap.common.Currencies";
    CommonType["Languages"] = "sap.common.Languages";
})(CommonType = exports.CommonType || (exports.CommonType = {}));
var Kind;
(function (Kind) {
    Kind["Service"] = "service";
    Kind["Entity"] = "entity";
    Kind["Type"] = "type";
    Kind["Function"] = "function";
    Kind["Action"] = "action";
    Kind["Association"] = "cds.Association";
})(Kind = exports.Kind || (exports.Kind = {}));
var Cardinality;
(function (Cardinality) {
    Cardinality["many"] = "*";
    Cardinality[Cardinality["one"] = 1] = "one";
})(Cardinality = exports.Cardinality || (exports.Cardinality = {}));
function isServiceDef(definition) {
    return definition.kind === Kind.Service;
}
exports.isServiceDef = isServiceDef;
function isEntityDef(definition) {
    return definition.kind === Kind.Entity;
}
exports.isEntityDef = isEntityDef;
function isTypeDef(definition) {
    return definition.kind === Kind.Type;
}
exports.isTypeDef = isTypeDef;
function isTypeAliasDef(definition) {
    return (definition.kind === Kind.Type &&
        definition.type !== undefined &&
        definition.enum === undefined);
}
exports.isTypeAliasDef = isTypeAliasDef;
function isArrayTypeAliasDef(definition) {
    return (definition.kind === Kind.Type &&
        definition.type === undefined &&
        definition.items !== undefined);
}
exports.isArrayTypeAliasDef = isArrayTypeAliasDef;
function isArrayTypeAliasTypeItems(items) {
    return items.type !== undefined;
}
exports.isArrayTypeAliasTypeItems = isArrayTypeAliasTypeItems;
function isArrayTypeAliasElementItems(items) {
    return items.elements !== undefined;
}
exports.isArrayTypeAliasElementItems = isArrayTypeAliasElementItems;
function isStructuredTypeDef(definition) {
    return (definition.kind === Kind.Type &&
        definition.type === undefined &&
        definition.elements !== undefined);
}
exports.isStructuredTypeDef = isStructuredTypeDef;
function isEnumTypeDef(definition) {
    return (definition.kind === Kind.Type &&
        definition.type !== undefined &&
        definition.enum !== undefined);
}
exports.isEnumTypeDef = isEnumTypeDef;
function isActionDef(definition) {
    return definition.kind === Kind.Action;
}
exports.isActionDef = isActionDef;
function isFunctionDef(definition) {
    return definition.kind === Kind.Function;
}
exports.isFunctionDef = isFunctionDef;
function isReturnsSingle(returns) {
    return returns.items === undefined;
}
exports.isReturnsSingle = isReturnsSingle;
function isReturnsMulti(returns) {
    return returns.items !== undefined;
}
exports.isReturnsMulti = isReturnsMulti;
function isTypeRef(type) {
    return (type === null || type === void 0 ? void 0 : type.ref) !== undefined;
}
exports.isTypeRef = isTypeRef;
function isType(type) {
    const values = Object.keys(Type).map((k) => Type[k]);
    return values.includes(type);
}
exports.isType = isType;
