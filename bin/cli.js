#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const program_1 = require("./program");
function main() {
    const cli = new commander_1.default.Command();
    cli.version(require("../package.json").version)
        .description("CLI to convert CDS models to Typescript interfaces and enumerations")
        .option("-c, --cds <file.cds>", "CDS file to convert")
        .option("-o, --output ./<path>/", "Output location in which the generated *.ts files are written to. Make sure the path ends with '/'.")
        .option("-p, --prefix <I>", "Interface prefix", "")
        .option("-j, --json", "Prints the compiled JSON representation of the CDS sources")
        .option("-d, --debug", "Prints JavaScript error message, should be used for issue reporting => https://github.com/mrbandler/cds2types/issues")
        .option("-f, --format", "Flag, whether to format the outputted source code or not (will try to format with prettier rules in the project)")
        .option("-s, --sort", "Flag, whether to sort outputted source code or not")
        .parse(process.argv);
    if (!process.argv.slice(2).length) {
        cli.outputHelp();
    }
    else {
        const options = cli.opts();
        new program_1.Program().run(options).catch((error) => {
            const debugHint = "Please use the debug flag (-d, --debug) for a detailed error message.";
            console.log(`Unable to write types. ${options.debug ? "" : debugHint}`);
            if (options.debug)
                console.error("Error:", error.message);
            process.exit(-1);
        });
    }
}
main();
