// functions are exported just to satisfy the linter
// this file is used within the parser generator
// (see how "update-parser.bash" works)
import { Expression, FunctionCall, Literal } from './expressions';

type Element = [unknown, string, unknown, Expression];

export function buildBinaryExpressionChain(head: Expression, tail: Element[]): Expression {
    return tail.reduce(
        (acc: Expression, element): Expression => ({
            kind: 'call',
            functionName: element[1],
            arguments: [acc, element[3]],
        }),
        head,
    );
}

export function makeCall(functionName: string, args: Expression[]): FunctionCall {
    return {
        kind: 'call',
        functionName,
        arguments: args,
    };
}

export function makeNumber(value: number): Literal {
    return {
        kind: 'literal',
        value: {
            kind: 'number',
            value,
        },
    };
}