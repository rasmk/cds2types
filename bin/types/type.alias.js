"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeAlias = void 0;
const base_type_1 = require("./base.type");
class TypeAlias extends base_type_1.BaseType {
    get def() {
        return this.definition;
    }
    constructor(name, definition, namespace) {
        super(name, definition, undefined, namespace);
    }
    toType(types) {
        if (this.def.elements) {
            return this.toStructuredTypeAlias(this.def.elements, types);
        }
        else if (this.def.type) {
            return this.toTypeAlias(this.def.type, types);
        }
        return undefined;
    }
    toTypeAlias(type, types) {
        type = this.resolveType(type, types);
        if (this.def.isArray) {
            type = `${type}[]`;
        }
        const name = this.sanitizeName(this.sanitizeTarget(this.name));
        return this.createTypeAlias(name, type);
    }
    toStructuredTypeAlias(elements, types) {
        const interfaceName = this.sanitizeName(this.sanitizeTarget(this.name));
        const fields = Array.from(elements)
            .map(([key, value]) => this.createInterfaceField(key, value, types, interfaceName, this.prefix))
            .map((f) => `${f.name}${f.hasQuestionToken ? "?" : ""}: ${f.type}`);
        let type = `{ ${fields.join(";\n")} }`;
        if (this.def.isArray) {
            type = `${type}[]`;
        }
        const name = this.sanitizeName(this.sanitizeTarget(this.name));
        return this.createTypeAlias(name, type);
    }
}
exports.TypeAlias = TypeAlias;
