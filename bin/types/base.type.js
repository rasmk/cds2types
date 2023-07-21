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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseType = void 0;
const morph = __importStar(require("ts-morph"));
const lodash_1 = __importDefault(require("lodash"));
const cds_types_1 = require("../utils/cds.types");
class BaseType {
    get Name() {
        return this.name;
    }
    get Definition() {
        return this.definition;
    }
    constructor(name, definition, prefix = "", namespace = "") {
        this.prefix = prefix;
        this.namespace = namespace;
        this.name = name;
        this.definition = definition;
    }
    getSanitizedName(withNamespace = false, withPrefix = false) {
        let name = this.sanitizeName(this.sanitizeTarget(this.name));
        if (withPrefix && (this.prefix || this.prefix !== "")) {
            name = this.prefix + name;
        }
        if (withNamespace && (this.namespace || this.namespace !== "")) {
            name = `${this.namespace}.${name}`;
        }
        return name;
    }
    createInterface(prefix = "", suffix = "", ext) {
        const sanitizedName = `${prefix}${this.sanitizeName(this.sanitizeTarget(this.name))}${suffix}`;
        return {
            kind: morph.StructureKind.Interface,
            name: this.prefix + sanitizedName,
            extends: ext,
            properties: [],
            isExported: true,
        };
    }
    createInterfaceField(name, element, types, interfaceName, prefix = "") {
        let fieldName = name;
        if (fieldName.includes("/"))
            fieldName = `"${fieldName}"`;
        if (element.canBeNull || element.type === cds_types_1.Type.Association || name === "texts")
            fieldName = `${fieldName}?`;
        let fieldType = "unknown";
        if (element.enum) {
            fieldType =
                this.sanitizeName(this.sanitizeTarget(this.name)) +
                    this.sanitizeName(name);
        }
        else {
            fieldType = this.cdsElementToType(element, types, interfaceName, prefix);
        }
        return {
            kind: morph.StructureKind.PropertySignature,
            name: fieldName,
            type: fieldType,
        };
    }
    createEnum(prefix = "") {
        const name = prefix + this.sanitizeName(this.sanitizeTarget(this.name));
        return {
            kind: morph.StructureKind.Enum,
            name: name,
            members: [],
            isExported: true,
        };
    }
    createEnumField(name, value, isStringType) {
        const fieldValue = (isStringType ? `${value}` : value);
        return {
            kind: morph.StructureKind.EnumMember,
            name: name,
            value: value ? fieldValue : undefined,
        };
    }
    createTypeAlias(name, type) {
        return {
            kind: morph.StructureKind.TypeAlias,
            name: name,
            type: type,
            isExported: true,
        };
    }
    sanitizeName(name) {
        let result = name;
        if (/[a-z]/.test(name.substr(0, 1))) {
            result =
                name.substring(0, 1).toUpperCase() +
                    name.substring(1, name.length);
        }
        if (name.includes(".")) {
            result = lodash_1.default.replace(lodash_1.default.startCase(name), new RegExp(" ", "g"), "");
        }
        return result;
    }
    sanitizeTarget(target) {
        return this.sanitizeName(this.getTarget(target));
    }
    getTarget(target) {
        const parts = target.replace(`${this.namespace}.`, "").split(".");
        let result = target;
        if (lodash_1.default.last(parts) === "texts") {
            result = lodash_1.default.join(lodash_1.default.takeRight(parts, 2), ".");
        }
        else {
            result = parts[parts.length - 1];
        }
        return result;
    }
    getNamespace(target) {
        const parts = target.split(".");
        parts.splice(parts.length - 1);
        return parts.join(".");
    }
    resolveType(type, types) {
        let result = "unknown";
        if ((0, cds_types_1.isType)(type)) {
            result = this.cdsTypeToType(type);
        }
        else {
            const found = types.find((t) => t.name === type || t.name === `${t.namespace}.${type}`);
            if (found) {
                result = found.getSanitizedName(false, true);
                if (this.namespace !== "" && result.includes(this.namespace)) {
                    result = result.replace(`${this.namespace}.`, "");
                }
            }
        }
        return result;
    }
    cdsTypeToType(type) {
        let result = "unknown";
        switch (type) {
            case cds_types_1.Type.Uuid:
                result = "string";
                break;
            case cds_types_1.Type.String:
                result = "string";
                break;
            case cds_types_1.Type.LargeString:
                result = "string";
                break;
            case cds_types_1.Type.User:
                result = "string";
                break;
            case cds_types_1.Type.Boolean:
                result = "boolean";
                break;
            case cds_types_1.Type.Integer:
                result = "number";
                break;
            case cds_types_1.Type.Integer64:
                result = "number";
                break;
            case cds_types_1.Type.Decimal:
                result = "number";
                break;
            case cds_types_1.Type.DecimalFloat:
                result = "number";
                break;
            case cds_types_1.Type.DecimalFloat:
                result = "number";
                break;
            case cds_types_1.Type.Double:
                result = "number";
                break;
            case cds_types_1.Type.Date:
                result = "Date";
                break;
            case cds_types_1.Type.Time:
                result = "Date";
                break;
            case cds_types_1.Type.DateTime:
                result = "Date";
                break;
            case cds_types_1.Type.Timestamp:
                result = "Date";
                break;
            case cds_types_1.Type.Binary:
                result = "Buffer";
                break;
            case cds_types_1.Type.LargeBinary:
                result = "Buffer";
                break;
            case cds_types_1.Type.HanaTinyint:
                result = "number";
                break;
        }
        return result;
    }
    commonTypeToType(type) {
        let result = "unknown";
        switch (type) {
            case cds_types_1.CommonType.CodeList:
                result = "CodeList";
                break;
            case cds_types_1.CommonType.Countries:
                result = "Countries";
                break;
            case cds_types_1.CommonType.Currencies:
                result = "Currencies";
                break;
            case cds_types_1.CommonType.Languages:
                result = "Languages";
                break;
        }
        return result;
    }
    cdsElementToType(element, types, interfaceName, prefix = "") {
        let result = "unknown";
        switch (element.type) {
            case cds_types_1.Type.Association:
                result = this.resolveTargetType(element, interfaceName, prefix);
                break;
            case cds_types_1.Type.Composition:
                result = this.resolveTargetType(element, interfaceName, prefix);
                break;
            case "Locale":
                result = "Locale";
                break;
            default:
                if (element.target) {
                    if (element.target.startsWith("sap.common.")) {
                        result = this.commonTypeToType(element.target);
                    }
                    else {
                        result = this.resolveTargetType(element, interfaceName, prefix);
                    }
                }
                else {
                    result = this.resolveType(element.type, types);
                    if (element.cardinality &&
                        element.cardinality.max === cds_types_1.Cardinality.many) {
                        result = `${result}[]`;
                    }
                }
                break;
        }
        return result;
    }
    resolveTargetType(element, interfaceName, prefix = "") {
        let result = "";
        if (element && element.target && element.cardinality) {
            let target = "";
            if (element.target.includes(this.namespace)) {
                target = prefix + this.sanitizeTarget(element.target);
            }
            else {
                const namespace = this.getNamespace(element.target);
                const namespaceForTarget = namespace === "" || namespace === interfaceName || namespace === "sap.common" ? "" : `${namespace}.`;
                target = namespaceForTarget +
                    prefix +
                    this.sanitizeTarget(element.target);
            }
            let suffix = "";
            if (element.cardinality.max === cds_types_1.Cardinality.many) {
                suffix = "[]";
            }
            result = target + suffix;
        }
        return result;
    }
}
exports.BaseType = BaseType;
