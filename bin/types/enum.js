"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enum = void 0;
const base_type_1 = require("./base.type");
const cds_types_1 = require("../utils/cds.types");
class Enum extends base_type_1.BaseType {
    get def() {
        return this.definition;
    }
    constructor(name, definition, namespace) {
        super(name, definition, undefined, namespace);
        this.fields = new Map();
        if (this.def.enum) {
            for (const [key, value] of this.def.enum) {
                this.fields.set(key, value.val);
            }
        }
    }
    toType() {
        var _a;
        const result = this.createEnum();
        for (const [key, value] of this.fields) {
            (_a = result.members) === null || _a === void 0 ? void 0 : _a.push(this.createEnumField(key, value, this.isStringType()));
        }
        return result;
    }
    isStringType() {
        let result = false;
        if (this.def.type === cds_types_1.Type.String ||
            this.def.type === cds_types_1.Type.LargeString) {
            result = true;
        }
        return result;
    }
}
exports.Enum = Enum;
