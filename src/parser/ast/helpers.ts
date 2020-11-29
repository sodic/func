// functions are exported just to satisfy the linter
// this file is used within the parser generator
// (see how "update-parser.bash" works)
import { Expression, Call, IdentifierReference, Literal } from './expressions';
import { Assignment, FunctionDefinition } from './index';

export function makeCall(callee: Expression, args: Expression[]): Call {
    return {
        kind: 'call',
        callee,
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

export function makeAssignment(name: string, expression: Expression): Assignment {
    return {
        kind: 'assignment',
        name,
        expression,
    };
}

export function makeIdentifierReference(name: string): IdentifierReference {
    return {
        kind: 'identifier',
        name,
    };
}

export function makeFunctionDefinition(name: string, params: string[], body: Expression): FunctionDefinition {
    return {
        kind: 'function',
        name,
        params,
        body,
    };
}

type BinaryCainElement = [unknown, string, unknown, Expression];
export function buildBinaryExpressionChain(head: Expression, tail: BinaryCainElement[]): Expression {
    return tail.reduce(
        (acc: Expression, element): Expression => ({
            kind: 'call',
            callee: makeIdentifierReference(element[1]),
            arguments: [acc, element[3]],
        }),
        head,
    );
}

type CallChainElement = [unknown, Expression[]];
export function buildCallChain(head: Call, tail: CallChainElement[]): Expression {
    return tail.reduce(
        (acc: Call, element: CallChainElement): Call => ({
            kind: 'call',
            callee: acc,
            arguments: element[1],
        }),
        head,
    );
}
