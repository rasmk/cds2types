"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionFunction = void 0;
const cds_types_1 = require("../utils/cds.types");
const base_type_1 = require("./base.type");
const entity_1 = require("./entity");
class ActionFunction extends base_type_1.BaseType {
    get def() {
        return this.definition;
    }
    constructor(name, definition, kind, interfacePrefix, namespace) {
        super(name, definition, interfacePrefix, namespace);
        this.FUNC_PREFIX = "Func";
        this.ACTION_PREFIX = "Action";
        this.params = [];
        this.kind = kind;
        if (this.definition && this.def.params) {
            for (const [key] of this.def.params) {
                this.params.push(key);
            }
        }
    }
    toType(types) {
        const prefix = this.kind === cds_types_1.Kind.Function ? this.FUNC_PREFIX : this.ACTION_PREFIX;
        return {
            enumDeclarationStructure: this.createEnumDeclaration(prefix),
            interfaceDeclarationStructure: this.createInterfaceDeclaration(prefix, types),
            typeAliasDeclarationStructure: this.createTypeDeclaration(prefix, types),
        };
    }
    createEnumDeclaration(prefix) {
        var _a, _b;
        const result = this.createEnum(prefix);
        (_a = result.members) === null || _a === void 0 ? void 0 : _a.push(this.createEnumField("name", this.getTarget(this.name), true));
        if (this.def.params) {
            for (const [key] of this.def.params) {
                const fieldName = "param" + this.sanitizeName(key);
                (_b = result.members) === null || _b === void 0 ? void 0 : _b.push(this.createEnumField(fieldName, key, true));
            }
        }
        return result;
    }
    createInterfaceDeclaration(prefix, types) {
        var _a, _b;
        let result = undefined;
        if (this.def.params && this.def.params.size > 0) {
            result = this.createInterface(prefix, "Params");
            const interfaceName = this.sanitizeName(this.sanitizeTarget(this.name));
            for (const [key, value] of this.def.params) {
                if ((0, cds_types_1.isTypeRef)(value.type)) {
                    const typeRef = value.type;
                    const type = types.find((t) => t.Name === typeRef.ref[0]);
                    if (type && type instanceof entity_1.Entity) {
                        const element = type.getElement(typeRef.ref[1]);
                        if (element) {
                            (_a = result.properties) === null || _a === void 0 ? void 0 : _a.push(this.createInterfaceField(key, element, types, interfaceName));
                        }
                    }
                }
                else {
                    const type = this.cdsElementToType({
                        type: value.type,
                        canBeNull: false,
                        cardinality: value.isArray
                            ? { max: cds_types_1.Cardinality.many }
                            : { max: cds_types_1.Cardinality.one },
                    }, types, interfaceName);
                    (_b = result.properties) === null || _b === void 0 ? void 0 : _b.push({
                        name: key,
                        type: type,
                    });
                }
            }
        }
        return result;
    }
    createTypeDeclaration(prefix, types) {
        let result = undefined;
        if (this.def.returns) {
            const target = this.sanitizeTarget(this.name);
            const name = `${prefix}${this.sanitizeName(target)}Return`;
            let type = this.resolveType(this.def.returns.type, types);
            if (this.def.returns.isArray) {
                type = `${type}[]`;
            }
            result = this.createTypeAlias(name, type);
        }
        return result;
    }
}
exports.ActionFunction = ActionFunction;
