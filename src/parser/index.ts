import fs from 'fs';
import { generate as generateParser } from 'pegjs';
import { Expression } from './ast/expressions';
// import * as helpers from './ast/helpers';

export function parse(source: string): Expression {
    // todo generate prior to compiling once the parser becomes stable
    const parser = getParser();
    return parser.parse(source);
}

function getParser() {
    const grammar = fs.readFileSync('resources/grammar/grammar.pegjs').toString();
    return generateParser(grammar);
}
