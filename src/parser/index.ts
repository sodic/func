import { Module, Expression, Statement } from '../ast';
import { failure, Result, success } from '../util';
import { moduleParser, expressionParser, statementParser } from './pegjsParsers';

export function parse(source: string): Result<Module, string> {
    try {
        const ast = parseModule(source);
        return success(ast);
    } catch (e) {
        return failure(`Syntax error: ${e.message}`);
    }
}

export function parseModule(source: string): Module {
    return moduleParser.parse(source) as Module;
}

export function parseStatement(source: string): Statement {
    return statementParser.parse(source) as Statement;
}

export function parseExpression(source: string): Expression {
    return expressionParser.parse(source) as Expression;
}
// // for debugging
// function parseBase(source: string, parser: Parser): Expression | Statement | Module {
//     const tracer = new Tracer(source);
//     try {
//         return parser.parse(source, { tracer });
//     } catch(e) {
//         console.log(tracer.getBacktraceString());
//         throw e;
//     }
// }
