// functions are exported just to satisfy the linter
// this file is used within the parser generator
// (see how "update-parser.bash" works)
import { Expression, FunctionCall, Literal } from './expressions';

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