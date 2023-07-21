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
exports.Entity = void 0;
const morph = __importStar(require("ts-morph"));
const cds_types_1 = require("../utils/cds.types");
const base_type_1 = require("./base.type");
const enum_1 = require("./enum");
const action_func_1 = require("./action.func");
class Entity extends base_type_1.BaseType {
    get def() {
        return this.definition;
    }
    constructor(name, definition, prefix = "", namespace = "") {
        super(name, definition, prefix, namespace);
    }
    toType(types) {
        var _a, _b, _c;
        const ext = this.getExtensionInterfaces(types);
        const extFields = this.getExtensionInterfaceFields(types);
        const result = {
            interfaceDeclarationStructure: this.createInterface("", "", ext),
            enumDeclarationStructures: [],
            actionFuncStructures: [],
        };
        if (this.def.elements) {
            const interfaceName = this.sanitizeName(this.sanitizeTarget(this.name));
            for (const [key, value] of this.def.elements) {
                if (value.enum) {
                    result.enumDeclarationStructures.push(this.createEnumDeclaration(key, value));
                    (_a = result.interfaceDeclarationStructure.properties) === null || _a === void 0 ? void 0 : _a.push(this.createInterfaceField(key, value, types, interfaceName, this.prefix));
                }
                else {
                    if (!extFields.includes(key)) {
                        const field = this.createInterfaceField(key, value, types, interfaceName, this.prefix);
                        (_b = result.interfaceDeclarationStructure.properties) === null || _b === void 0 ? void 0 : _b.push(field);
                        if (value.cardinality &&
                            value.cardinality.max === cds_types_1.Cardinality.one) {
                            const fields = this.getAssociationRefField(types, key, "_", value);
                            (_c = result.interfaceDeclarationStructure.properties) === null || _c === void 0 ? void 0 : _c.push(...fields);
                        }
                    }
                }
            }
        }
        if (this.def.actions) {
            for (const [key, value] of this.def.actions) {
                const actionFunc = new action_func_1.ActionFunction(key, value, value.kind, this.prefix, this.name);
                const actionFuncDeclaration = actionFunc.toType(types);
                result.actionFuncStructures.push(actionFuncDeclaration);
            }
        }
        return result;
    }
    getFields() {
        let result = [];
        if (this.def.elements) {
            result = Array.from(this.def.elements.keys());
        }
        return result;
    }
    getElement(name) {
        var _a;
        return (_a = this.def.elements) === null || _a === void 0 ? void 0 : _a.get(name);
    }
    createEnumDeclaration(key, value) {
        const enumName = this.sanitizeName(this.sanitizeTarget(this.name)) +
            this.sanitizeName(key);
        const definition = {
            kind: cds_types_1.Kind.Type,
            type: value.type,
            enum: value.enum,
        };
        const enumType = new enum_1.Enum(enumName, definition);
        return enumType.toType();
    }
    getExtensionInterfaces(types) {
        let result = undefined;
        if (this.def.includes) {
            const entities = types.filter((e) => this.def.includes ? this.def.includes.includes(e.Name) : false);
            if (entities) {
                result = entities.map((e) => e.getSanitizedName(false, true));
            }
        }
        return result;
    }
    getExtensionInterfaceFields(types) {
        const result = [];
        if (this.def.includes) {
            const filtered = types
                .filter((e) => this.def.includes
                ? this.def.includes.includes(e.Name)
                : false)
                .filter((f) => f instanceof Entity);
            if (filtered) {
                for (const entity of filtered) {
                    result.push(...entity.getFields());
                }
            }
        }
        return result;
    }
    getAssociationRefField(types, name, suffix, element) {
        const result = [];
        if (element.target && element.keys) {
            const type = types.find((t) => element.target === t.Name);
            if (type && type instanceof Entity && type.def.elements) {
                for (const key of element.keys) {
                    for (const [k, v] of type.def.elements) {
                        if (k === key.ref[0]) {
                            result.push({
                                kind: morph.StructureKind.PropertySignature,
                                name: `${name}${suffix}${k}`,
                                hasQuestionToken: true,
                                type: this.resolveType(v.type, types),
                            });
                            break;
                        }
                    }
                }
            }
        }
        return result;
    }
}
exports.Entity = Entity;
