"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CDSParser = void 0;
const cds_types_1 = require("./utils/cds.types");
const lodash_1 = __importDefault(require("lodash"));
class CDSParser {
    constructor() {
        this.services = [];
        this.namespaces = [];
        this.definitions = new Map();
    }
    parse(csn) {
        for (const name in csn.definitions) {
            const def = csn.definitions[name];
            if (this.isValid(name, def)) {
                if ((0, cds_types_1.isServiceDef)(def)) {
                    this.addService(name);
                    continue;
                }
                const definitions = this.getDefinitions(name);
                const parsed = this.parseDefinition(name, def);
                if (parsed)
                    definitions.set(name, parsed);
            }
        }
        return {
            services: this.services,
            namespaces: this.namespaces,
            definitions: this.definitions,
        };
    }
    parseDefinition(name, definition) {
        if ((0, cds_types_1.isTypeDef)(definition)) {
            if ((0, cds_types_1.isTypeAliasDef)(definition)) {
                return this.parseTypeAliasDef(definition);
            }
            else if ((0, cds_types_1.isArrayTypeAliasDef)(definition)) {
                return this.parseArrayTypeAliasDef(name, definition);
            }
            else if ((0, cds_types_1.isStructuredTypeDef)(definition)) {
                return this.parseEntityOrStructuredTypeDef(name, definition);
            }
            else if ((0, cds_types_1.isEnumTypeDef)(definition)) {
                return this.parseEnumDef(definition);
            }
        }
        else {
            if ((0, cds_types_1.isEntityDef)(definition)) {
                return this.parseEntityOrStructuredTypeDef(name, definition);
            }
            else if ((0, cds_types_1.isActionDef)(definition) || (0, cds_types_1.isFunctionDef)(definition)) {
                return this.parseActionFunctionDef(definition);
            }
        }
        return undefined;
    }
    parseTypeAliasDef(definition) {
        return {
            kind: definition.kind,
            type: definition.type,
            isArray: false,
        };
    }
    parseArrayTypeAliasDef(name, definition) {
        if ((0, cds_types_1.isArrayTypeAliasTypeItems)(definition.items)) {
            return {
                kind: definition.kind,
                type: definition.items.type,
                isArray: true,
            };
        }
        else {
            return {
                kind: definition.kind,
                elements: this.parseElements(name, definition.items.elements),
                isArray: true,
            };
        }
    }
    parseEntityOrStructuredTypeDef(name, definition) {
        return {
            kind: definition.kind,
            type: (0, cds_types_1.isTypeAliasDef)(definition) ? definition.type : undefined,
            elements: this.parseElements(name, definition.elements),
            actions: (0, cds_types_1.isEntityDef)(definition)
                ? this.parseBoundActions(definition.actions)
                : undefined,
            includes: (0, cds_types_1.isEntityDef)(definition) ? definition.includes || [] : [],
        };
    }
    parseEnumDef(definition) {
        return {
            kind: definition.kind,
            type: definition.type,
            enum: this.parseEnum(definition),
        };
    }
    parseActionFunctionDef(definition) {
        return {
            kind: definition.kind,
            params: this.parseParams(definition),
            returns: this.parseReturns(definition),
        };
    }
    parseElements(name, elements) {
        const result = new Map();
        if (elements) {
            for (const elementName in elements) {
                if (elements.hasOwnProperty(elementName)) {
                    const element = elements[elementName];
                    if (this.isLocalizationField(element))
                        continue;
                    if (!element.type && !element.items) {
                        if (element.type === undefined) {
                            throw new Error(`Unable to parse element '${elementName}' on entity '${name}'. It seems to be a CDS expression without a type definition, please add a type to it.`);
                        }
                    }
                    const type = element.type
                        ? element.type
                        : element.items
                            ? element.items.type
                            : "";
                    const canBeNull = element["@Core.Computed"] ||
                        element["@Core.Immutable"] ||
                        element.virtual ||
                        element.default
                        ? true
                        : false ||
                            elementName === cds_types_1.Managed.CreatedAt ||
                            elementName === cds_types_1.Managed.CreatedBy ||
                            elementName === cds_types_1.Managed.ModifiedAt ||
                            elementName === cds_types_1.Managed.ModifiedBy;
                    const cardinality = element.cardinality
                        ? element.cardinality
                        : element.items
                            ? { max: cds_types_1.Cardinality.many }
                            : { max: cds_types_1.Cardinality.one };
                    const _enum = this.parseEnum(element);
                    result.set(elementName, {
                        type: type,
                        canBeNull: canBeNull,
                        cardinality: cardinality,
                        target: element.target,
                        enum: _enum.size <= 0 ? undefined : _enum,
                        keys: element.keys,
                    });
                }
            }
        }
        return result;
    }
    parseBoundActions(actions) {
        const result = new Map();
        if (actions) {
            for (const actionName in actions) {
                if (actions.hasOwnProperty(actionName)) {
                    const action = actions[actionName];
                    const parsedAction = this.parseActionFunctionDef(action);
                    result.set(actionName, parsedAction);
                }
            }
        }
        return result;
    }
    parseEnum(definition) {
        const result = new Map();
        if (definition.enum) {
            for (const key in definition.enum) {
                if (definition.enum.hasOwnProperty(key)) {
                    const value = definition.enum[key];
                    result.set(key, value);
                }
            }
        }
        return result;
    }
    parseParams(definition) {
        const result = new Map();
        if (definition.params) {
            for (const key in definition.params) {
                if (definition.params[key].items !== undefined) {
                    const value = this.parseArrayTypeAliasDef(key, definition.params[key]);
                    result.set(key, value);
                }
                else if (definition.params.hasOwnProperty(key)) {
                    const value = definition.params[key];
                    result.set(key, value);
                }
            }
        }
        return result;
    }
    parseReturns(definition) {
        if (definition.returns) {
            if ((0, cds_types_1.isReturnsSingle)(definition.returns)) {
                return {
                    type: definition.returns.type,
                    isArray: false,
                };
            }
            else if ((0, cds_types_1.isReturnsMulti)(definition.returns)) {
                return {
                    type: definition.returns.items.type,
                    isArray: true,
                };
            }
        }
        return undefined;
    }
    isValid(name, value) {
        if (value.kind !== cds_types_1.Kind.Entity &&
            value.kind !== cds_types_1.Kind.Type &&
            value.kind !== cds_types_1.Kind.Function &&
            value.kind !== cds_types_1.Kind.Action &&
            value.kind !== cds_types_1.Kind.Service)
            return false;
        if ((0, cds_types_1.isTypeAliasDef)(value)) {
            if (value.type === cds_types_1.Type.Association)
                return false;
        }
        if (name.includes("_texts") || name.startsWith("localized."))
            return false;
        return true;
    }
    isLocalizationField(obj) {
        let result = false;
        if (obj && obj.target) {
            const target = obj.target;
            result = target.includes("_texts");
        }
        return result;
    }
    addService(name) {
        const service = {
            name: name,
            definitions: new Map(),
        };
        this.services.push(service);
        return service;
    }
    addNamespace(name) {
        const namespace = {
            name: name,
            definitions: new Map(),
        };
        this.namespaces.push(namespace);
        return namespace;
    }
    getDefinitions(name) {
        const service = this.services.find((s) => name.includes(s.name));
        if (service) {
            return service.definitions;
        }
        const namespace = this.namespaces.find((n) => name.includes(n.name));
        if (namespace) {
            return namespace.definitions;
        }
        else {
            const split = name.split(".");
            if (split.length > 1) {
                const entity = lodash_1.default.last(split);
                const namespaceName = name.replace(`.${entity}`, "");
                return this.addNamespace(namespaceName).definitions;
            }
            else {
                return this.definitions;
            }
        }
    }
}
exports.CDSParser = CDSParser;
