// some of the functions are exported just to satisfy the linter
// this file is used within the parser generator
// (see how "update-parser.bash" works)
import { Call, Conditional, Expression, ExpressionKind, Identifier, Literal, LiteralKind } from './expressions';
import { Assignment, FunctionDefinition, Module, Statement, StatementKind } from './statements';

export function makeCall(callee: Expression, args: Expression[]): Call {
    return {
        kind: ExpressionKind.Call,
        callee,
        arguments: args,
    };
}

export function makeNumber(value: number): Literal {
    return {
        kind: ExpressionKind.Literal,
        value: {
            kind: LiteralKind.Number,
            value,
        },
    };
}

export function makeIdentifierReference(name: string): Identifier {
    return {
        kind: ExpressionKind.Identifier,
        name,
    };
}

export function makeConditional(condition: Expression, thenBranch: Expression, elseBranch: Expression): Conditional {
    return {
        kind: ExpressionKind.Conditional,
        condition,
        thenBranch,
        elseBranch,
    } ;
}

type BinaryCainElement = [unknown, string, unknown, Expression];
export function buildBinaryExpressionChain(head: Expression, tail: BinaryCainElement[]): Expression {
    return tail.reduce(
        (acc: Expression, element): Expression => ({
            kind: ExpressionKind.Call,
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
            kind: ExpressionKind.Call,
            callee: acc,
            arguments: element[1],
        }),
        head,
    );
}

export function makeAssignment(name: string, expression: Expression): Assignment {
    return {
        kind: StatementKind.Assignment,
        name,
        expression,
    };
}

export function makeFunctionDefinition(name: string, params: string[], body: Expression): FunctionDefinition {
    return {
        kind: StatementKind.FunctionDefinition,
        name,
        params,
        body,
    };
}

export function makeModule(definitions: Statement[]): Module {
    return {
        kind: 'module',
        definitions,
    };
}
