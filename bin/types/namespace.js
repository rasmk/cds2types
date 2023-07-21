"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Namespace = void 0;
const types_1 = require("../utils/types");
const cds_types_1 = require("../utils/cds.types");
const action_func_1 = require("./action.func");
const entity_1 = require("./entity");
const type_alias_1 = require("./type.alias");
const enum_1 = require("./enum");
const lodash_1 = __importDefault(require("lodash"));
class Namespace {
    get name() {
        return this._name ? this._name : "";
    }
    get Definitions() {
        return this.definitions;
    }
    constructor(definitions, interfacePrefix = "", name) {
        this.entities = [];
        this.actionFunctions = [];
        this.enums = [];
        this.typeAliases = [];
        this._name = name;
        this.definitions = definitions;
        this.extractTypes(interfacePrefix);
    }
    getTypes() {
        const result = [];
        result.push(...this.typeAliases);
        result.push(...this.enums);
        result.push(...this.entities);
        return result;
    }
    generateCode(source, interfacePrefix = "", allNamespaces, elementsFromOtherNamespace, otherEntities) {
        const actionFuncDeclarations = this.actionFunctions.map((f) => f.toType(otherEntities));
        const enumDeclarations = this.enums.map((e) => e.toType());
        const entityDeclarations = this.entities.map((e) => e.toType(otherEntities));
        const entityEnumDeclaration = this.generateEntitiesEnum().toType();
        const sanitizedEntityEnumDeclaration = this.generateEntitiesEnum(true).toType();
        const typeAliasDeclarations = this.typeAliases.map((t) => t.toType(otherEntities));
        const importMap = new Map();
        if (!lodash_1.default.isNil(elementsFromOtherNamespace)) {
            for (const element of elementsFromOtherNamespace) {
                const relevantNamespace = allNamespaces.find((ns) => element.name.includes(ns));
                if (!lodash_1.default.isNil(relevantNamespace)) {
                    if (lodash_1.default.isNil(importMap.get(relevantNamespace))) {
                        importMap.set(relevantNamespace, []);
                    }
                    let elementWithoutNamespace = element.name.replace(`${relevantNamespace}.`, "");
                    if (element.kind === cds_types_1.Kind.Entity) {
                        elementWithoutNamespace = `${interfacePrefix}${elementWithoutNamespace}`;
                    }
                    const mapElement = importMap.get(relevantNamespace);
                    if (!lodash_1.default.isNil(mapElement) &&
                        !mapElement.some((element) => element === elementWithoutNamespace)) {
                        mapElement.push(elementWithoutNamespace);
                    }
                }
            }
        }
        for (const [key, element] of importMap) {
            source
                .addImportDeclaration({ moduleSpecifier: `./${key}` })
                .addNamedImports(element);
        }
        this.addTypeAliasDeclarations(typeAliasDeclarations, source);
        this.addEnumDeclarations(enumDeclarations, source);
        this.addEntityDeclarations(entityDeclarations, source);
        this.addActionFuncDeclarations(actionFuncDeclarations, source);
        source.addEnum(entityEnumDeclaration);
        source.addEnum(sanitizedEntityEnumDeclaration);
    }
    addActionFuncDeclarations(actionFuncDecls, source) {
        actionFuncDecls.forEach((afd) => {
            source.addEnum(afd.enumDeclarationStructure);
            if (afd.interfaceDeclarationStructure) {
                source.addInterface(afd.interfaceDeclarationStructure);
            }
            if (afd.typeAliasDeclarationStructure) {
                source.addTypeAlias(afd.typeAliasDeclarationStructure);
            }
        });
    }
    addEnumDeclarations(enumDecls, source) {
        enumDecls.forEach((ed) => {
            if (ed.members && !lodash_1.default.isEmpty(ed.members)) {
                source.addEnum(ed);
            }
        });
    }
    addEntityDeclarations(entityDecls, source) {
        entityDecls.forEach((ed) => {
            if (!lodash_1.default.isEmpty(ed.enumDeclarationStructures)) {
                this.addEnumDeclarations(ed.enumDeclarationStructures, source);
            }
            source.addInterface(ed.interfaceDeclarationStructure);
            if (!lodash_1.default.isEmpty(ed.actionFuncStructures)) {
                this.addActionFuncDeclarations(ed.actionFuncStructures, source);
            }
        });
    }
    addTypeAliasDeclarations(typeAliasDecls, source) {
        typeAliasDecls.forEach((tad) => {
            if (tad !== undefined) {
                source.addTypeAlias(tad);
            }
        });
    }
    extractTypes(interfacePrefix = "") {
        for (const [key, value] of this.definitions) {
            if (value == undefined)
                continue;
            if ((0, types_1.isType)(value)) {
                const typeAlias = new type_alias_1.TypeAlias(key, value, this.name);
                this.typeAliases.push(typeAlias);
            }
            else if ((0, types_1.isEntity)(value)) {
                const entity = new entity_1.Entity(key, value, interfacePrefix, this.name);
                this.entities.push(entity);
            }
            else if ((0, types_1.isEnum)(value)) {
                const _enum = new enum_1.Enum(key, value, this.name);
                this.enums.push(_enum);
            }
            else if ((0, types_1.isActionFunction)(value)) {
                const actionFunction = new action_func_1.ActionFunction(key, value, value.kind, interfacePrefix, this.name);
                this.actionFunctions.push(actionFunction);
            }
        }
    }
    generateEntitiesEnum(sanitized = false) {
        const definition = {
            kind: cds_types_1.Kind.Type,
            type: cds_types_1.Type.String,
            enum: new Map(),
        };
        if (definition.enum) {
            for (const entity of this.entities) {
                definition.enum.set(entity.getSanitizedName(), {
                    val: sanitized ? entity.getSanitizedName() : entity.Name,
                });
            }
        }
        return sanitized
            ? new enum_1.Enum("SanitizedEntity", definition)
            : new enum_1.Enum("Entity", definition);
    }
}
exports.Namespace = Namespace;
