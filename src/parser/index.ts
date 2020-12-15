import fs from 'fs';
import Tracer from 'pegjs-backtrace';
import { Module, Expression, Statement } from '../ast';
import { generate as generateParser, Parser } from 'pegjs';
import { failure, Result, success } from '../util';

export function parse(source: string): Result<Module, string> {
    try {
        const ast = parseModule(source);
        return success(ast);
    } catch (e) {
        return failure(e.message);
    }
}

export function parseExpression(source: string): Expression {
    return parseBase(source, 'Expression') as Expression;
}

export function parseStatement(source: string): Statement {
    return parseBase(source, 'Statement') as Statement;
}

export function parseModule(source: string): Module {
    return parseBase(source, 'Module') as Module;
}

const parsers: { [key: string]: Parser } = {};
type ParserResult = Expression | Statement | Module;
export function parseBase(source: string, startRule: string): ParserResult {
    // todo generate prior to compiling once the parser becomes stable
    parsers[startRule] = parsers[startRule] ?? getParser(startRule);
    const tracer = new Tracer(source);

    try {
        return parsers[startRule].parse(source, { tracer });
    } catch(e) {
        console.log(tracer.getBacktraceString());
        throw e;
    }
}

function getParser(startRule: string) {
    const grammar = fs.readFileSync('resources/grammar/grammar.pegjs').toString();
    return generateParser(grammar, {
        allowedStartRules: [startRule],
        trace: true,
    });
}
