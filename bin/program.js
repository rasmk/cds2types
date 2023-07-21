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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Program = void 0;
const cds_1 = __importDefault(require("@sap/cds"));
const fs = __importStar(require("fs-extra"));
const lodash_1 = __importDefault(require("lodash"));
const path = __importStar(require("path"));
const morph = __importStar(require("ts-morph"));
const cds_parser_1 = require("./cds.parser");
const noop_formatter_1 = require("./formatter/noop.formatter");
const prettier_formatter_1 = require("./formatter/prettier.formatter");
const namespace_1 = require("./types/namespace");
const cds_types_1 = require("./utils/cds.types");
const types_1 = require("./utils/types");
class Program {
    run(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsonObj = yield this.loadCdsAndConvertToJSON(options.cds, options.sort);
            if (options.json) {
                fs.writeFileSync(`${options.output}servicdefinitions.json`, JSON.stringify(jsonObj));
            }
            const parsed = new cds_parser_1.CDSParser().parse(jsonObj);
            const formatter = yield this.createFormatter(options);
            const settings = formatter.getSettings();
            const project = new morph.Project({ manipulationSettings: settings });
            yield this.generateCode(parsed, project, formatter, options);
        });
    }
    createFormatter(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return options.format
                ? yield new prettier_formatter_1.PrettierFormatter(options.output).init()
                : yield new noop_formatter_1.NoopFormatter(options.output).init();
        });
    }
    loadCdsAndConvertToJSON(path, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            const csn = yield cds_1.default.load(path);
            const result = JSON.parse(cds_1.default.compile.to.json(csn));
            if (sort) {
                result.definitions = Object.fromEntries(Object.entries(result.definitions).sort((key, value) => String(key[0]).localeCompare(value[0])));
            }
            return result;
        });
    }
    generateCode(parsed, project, formatter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const namespaces = [];
            if (parsed.namespaces) {
                const ns = parsed.namespaces.map((n) => new namespace_1.Namespace(n.definitions, options.prefix, n.name));
                namespaces.push(...ns);
            }
            if (parsed.services) {
                const ns = parsed.services.map((s) => new namespace_1.Namespace(s.definitions, options.prefix, s.name));
                namespaces.push(...ns);
            }
            if (parsed.definitions) {
                const ns = new namespace_1.Namespace(parsed.definitions, options.prefix);
                namespaces.push(ns);
            }
            const namespaceNames = namespaces.map((ns) => ns.name);
            for (const namespace of namespaces) {
                const source = project.createSourceFile(options.output + namespace.name);
                const types = lodash_1.default.flatten(namespaces.map((n) => n.getTypes()));
                const elementsFromOtherNamespaces = this.findElementsFromOtherNamespaces(namespace, namespaceNames, types);
                namespace.generateCode(source, options.prefix, namespaceNames, elementsFromOtherNamespaces.get(namespace.name), types);
                const namespaceName = lodash_1.default.isEmpty(namespace.name)
                    ? "other"
                    : namespace.name;
                yield this.writeSource(options.output, namespaceName, source.getFullText());
            }
            yield this.formatWrittenFiles(namespaceNames, options, formatter);
        });
    }
    formatWrittenFiles(namespaceNames, options, formatter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Unformatted files written.`);
            const formatProject = new morph.Project({
                manipulationSettings: formatter.getSettings(),
            });
            for (const namespace of namespaceNames) {
                const namespaceName = lodash_1.default.isEmpty(namespace) ? "other" : namespace;
                const file = formatProject.addSourceFileAtPath(`${options.output}${namespaceName}.ts`);
                if (file) {
                    let fileWithFixedImports = file
                        .fixMissingImports()
                        .fixUnusedIdentifiers();
                    fileWithFixedImports.formatText();
                    const formattedText = yield formatter.format(fileWithFixedImports.getFullText());
                    yield this.writeSource(options.output, namespaceName, formattedText);
                }
            }
            console.log(`Formatted files written.`);
        });
    }
    writeSource(filepath, namespaceName, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const dir = path.dirname(filepath);
            if (fs.existsSync(dir)) {
                const fullPath = `${filepath}${namespaceName}.ts`;
                fs.removeSync(fullPath);
                yield fs.writeFile(fullPath, source);
                console.log(`Wrote types to '${fullPath}'`);
            }
            else {
                console.error(`Unable to write types: '${dir}' is not a valid directory`);
                process.exit(-1);
            }
        });
    }
    findElementsFromOtherNamespaces(namespace, namespaceNames, types) {
        const otherNamespaces = new Map();
        otherNamespaces.set(namespace.name, []);
        for (const [key, value] of namespace.Definitions) {
            if ((0, types_1.isType)(value)) {
                this.checkTypeIfElementFromOtherNamespace(namespaceNames, value, namespace, types, otherNamespaces);
            }
            else if ((0, types_1.isEntity)(value)) {
                this.checkEntityIfElementFromOtherNamespace(value, namespaceNames, namespace, types, otherNamespaces);
            }
            else if ((0, types_1.isEnum)(value)) {
            }
            else if ((0, types_1.isActionFunction)(value)) {
                const params = value.params ? value.params : [];
                this.checkActionFunctionIfElementFromOtherNamespace(params, types, namespaceNames, namespace, otherNamespaces);
            }
        }
        return otherNamespaces;
    }
    checkTypeIfElementFromOtherNamespace(namespaceNames, value, namespace, types, otherNamespaces) {
        var _a, _b;
        const elementFromOtherNamespace = namespaceNames.find((ns) => {
            var _a, _b;
            return ((_a = value.type) === null || _a === void 0 ? void 0 : _a.includes(ns)) &&
                !((_b = value.type) === null || _b === void 0 ? void 0 : _b.includes(namespace.name));
        });
        if (!lodash_1.default.isEmpty(elementFromOtherNamespace)) {
            if (value.type) {
                const relevantType = types.find((t) => t.Name === value.type);
                (_a = otherNamespaces.get(namespace.name)) === null || _a === void 0 ? void 0 : _a.push({
                    kind: relevantType
                        ? (_b = relevantType.Definition) === null || _b === void 0 ? void 0 : _b.kind
                        : cds_types_1.Kind.Type,
                    name: value.type,
                });
            }
        }
    }
    checkEntityIfElementFromOtherNamespace(value, namespaceNames, namespace, types, otherNamespaces) {
        var _a, _b, _c, _d;
        const elements = value.elements ? value.elements : [];
        for (const [innerKey, element] of elements) {
            const elementFromOtherNamespace = namespaceNames.find((ns) => {
                var _a, _b, _c, _d;
                return (((_a = element.type) === null || _a === void 0 ? void 0 : _a.includes(ns)) &&
                    !((_b = element.type) === null || _b === void 0 ? void 0 : _b.includes(namespace.name))) ||
                    (((_c = element.target) === null || _c === void 0 ? void 0 : _c.includes(ns)) &&
                        !((_d = element.target) === null || _d === void 0 ? void 0 : _d.includes(namespace.name)));
            });
            if (!lodash_1.default.isEmpty(elementFromOtherNamespace)) {
                const relevantType = types.find((t) => t.Name === element.type);
                if (element.target) {
                    (_a = otherNamespaces.get(namespace.name)) === null || _a === void 0 ? void 0 : _a.push({
                        kind: relevantType
                            ? (_b = relevantType.Definition) === null || _b === void 0 ? void 0 : _b.kind
                            : cds_types_1.Kind.Entity,
                        name: element.target,
                    });
                }
                else {
                    (_c = otherNamespaces.get(namespace.name)) === null || _c === void 0 ? void 0 : _c.push({
                        kind: relevantType
                            ? (_d = relevantType.Definition) === null || _d === void 0 ? void 0 : _d.kind
                            : cds_types_1.Kind.Entity,
                        name: element.type,
                    });
                }
            }
        }
    }
    checkActionFunctionIfElementFromOtherNamespace(params, types, namespaceNames, namespace, otherNamespaces) {
        var _a, _b, _c, _d;
        for (const [innerKey, param] of params) {
            if (param[0] && param[0].value) {
                const relevantType = types.find((t) => t.Name === param[0].value.type.ref[0]);
                const elementFromOtherNamespace = namespaceNames.find((ns) => param[0].value.type.ref[0].includes(ns) &&
                    !param[0].value.type.ref[0].includes(namespace.name));
                if (!lodash_1.default.isEmpty(elementFromOtherNamespace)) {
                    (_a = otherNamespaces.get(namespace.name)) === null || _a === void 0 ? void 0 : _a.push({
                        kind: relevantType
                            ? (_b = relevantType.Definition) === null || _b === void 0 ? void 0 : _b.kind
                            : cds_types_1.Kind.Action,
                        name: param[0].value.type.ref[0],
                    });
                }
            }
            else if (param.type && typeof param.type !== "string") {
                const elementFromOtherNamespace = namespaceNames.find((ns) => param.type
                    ? param.type["ref"][0].includes(ns) &&
                        !param.type["ref"][0].includes(namespace.name)
                    : false);
                const relevantType = types.find((t) => param.type ? t.Name === param.type["ref"][0] : false);
                if (!lodash_1.default.isEmpty(elementFromOtherNamespace)) {
                    (_c = otherNamespaces.get(namespace.name)) === null || _c === void 0 ? void 0 : _c.push({
                        kind: relevantType
                            ? (_d = relevantType.Definition) === null || _d === void 0 ? void 0 : _d.kind
                            : cds_types_1.Kind.Action,
                        name: param.type["ref"][0],
                    });
                }
            }
        }
    }
}
exports.Program = Program;
