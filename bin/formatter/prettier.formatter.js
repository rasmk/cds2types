"use strict";
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
exports.PrettierFormatter = void 0;
const prettier_1 = __importDefault(require("prettier"));
const ts_morph_1 = require("ts-morph");
const formatter_1 = require("./formatter");
class PrettierFormatter extends formatter_1.Formatter {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield prettier_1.default.resolveConfig(this.output);
            if (options) {
                this.options = options;
                this.settings = {
                    indentationText: this.convertIndentation(this.options.useTabs, this.options.tabWidth),
                    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: this.options.bracketSpacing !== undefined
                        ? this.options.bracketSpacing
                        : true,
                    newLineKind: this.convertNewline(this.options.endOfLine),
                    quoteKind: this.options.singleQuote
                        ? ts_morph_1.QuoteKind.Single
                        : ts_morph_1.QuoteKind.Double,
                    useTrailingCommas: this.options.trailingComma === "none" ? false : true,
                };
            }
            else
                this.settings = {};
            return this;
        });
    }
    format(source) {
        return __awaiter(this, void 0, void 0, function* () {
            return prettier_1.default.format(source, Object.assign({ parser: "typescript" }, this.options));
        });
    }
    convertIndentation(useTabs, tabWidth) {
        if (useTabs)
            return ts_morph_1.IndentationText.Tab;
        switch (tabWidth) {
            case 2:
                return ts_morph_1.IndentationText.TwoSpaces;
            case 4:
                return ts_morph_1.IndentationText.FourSpaces;
            case 8:
                return ts_morph_1.IndentationText.EightSpaces;
            default:
                return ts_morph_1.IndentationText.TwoSpaces;
        }
    }
    convertNewline(eol) {
        switch (eol) {
            case "lf":
                return ts_morph_1.NewLineKind.LineFeed;
            case "crlf":
                return ts_morph_1.NewLineKind.CarriageReturnLineFeed;
            case "cr":
                return ts_morph_1.NewLineKind.CarriageReturnLineFeed;
            case "auto":
                return ts_morph_1.NewLineKind.LineFeed;
            default:
                return ts_morph_1.NewLineKind.LineFeed;
        }
    }
}
exports.PrettierFormatter = PrettierFormatter;
