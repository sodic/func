import fs from 'fs';
import { generate as generateParser, Parser } from 'pegjs';
import Tracer from 'pegjs-backtrace';
import { Expression } from './ast/expressions';
// import * as helpers from './ast/helpers';

let parser: Parser | null = null;

export function parse(source: string): Expression {
    // todo generate prior to compiling once the parser becomes stable
    parser = parser ?? getParser();
    const tracer = new Tracer(source);
    try {
        return parser.parse(source, { tracer });
    } catch(e) {
        console.log(tracer.getBacktraceString());
        throw e;
    }
}

function getParser() {
    const grammar = fs.readFileSync('resources/grammar/grammar.pegjs').toString();
    return generateParser(grammar, {
        trace: true,
    });
}
