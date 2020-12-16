import { Parser } from 'pegjs';
import Tracer from 'pegjs-backtrace';
import { Module, Expression, Statement } from '../ast';
import { failure, Result, success } from '../util';
import { moduleParser, expressionParser, statementParser } from './pegjsParsers';

export function parse(source: string): Result<Module, string> {
    try {
        const ast = parseModule(source);
        return success(ast);
    } catch (e) {
        return failure(e.message);
    }
}

export function parseExpression(source: string): Expression {
    return parseBase(source, expressionParser) as Expression;
}

export function parseStatement(source: string): Statement {
    return parseBase(source, statementParser) as Statement;
}

export function parseModule(source: string): Module {
    return parseBase(source, moduleParser) as Module;
}

type ParserResult = Expression | Statement | Module;
function parseBase(source: string, parser: Parser): ParserResult {
    const tracer = new Tracer(source);
    try {
        return parser.parse(source, { tracer });
    } catch(e) {
        console.log(tracer.getBacktraceString());
        throw e;
    }
}
