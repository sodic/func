// some of the functions are exported just to satisfy the linter
// this file is used within the parser generator
// (see how "update-parser.bash" works)
import {
    Application,
    Conditional,
    Expression,
    ExpressionKind,
    Identifier,
    Lambda,
    Let,
    Literal,
    LiteralKind,
} from './expressions';
import { Assignment, FunctionDefinition, Statement, StatementKind } from './statements';
import { Module } from './module';

export function makeNumber(value: number): Literal {
    return {
        kind: ExpressionKind.Literal,
        value: {
            kind: LiteralKind.Number,
            value,
        },
    };
}

export function makeBoolean(value: boolean): Literal {
    return {
        kind: ExpressionKind.Literal,
        value: {
            kind: LiteralKind.Boolean,
            value,
        },
    };
}

// todo check notes to improve this
export function makeString(value: string): Literal {
    return {
        kind: ExpressionKind.Literal,
        value: {
            kind: LiteralKind.String,
            value,
        },
    };
}

export function makeBigInt(value: bigint): Literal {
    return {
        kind: ExpressionKind.Literal,
        value: {
            kind: LiteralKind.BigInt,
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

export function parenthesize(expression: Expression): Expression {
    return {
        ...expression,
        parentheses: true,
    };
}

export function makeAssignment(name: string, expression: Expression): Assignment {
    return {
        kind: StatementKind.Assignment,
        name,
        expression,
    };
}

export function makeModule(definitions: Statement[]): Module {
    return {
        statements: definitions,
    };
}

export function makeFunctionDefinition(name: string, params: string[], body: Expression): FunctionDefinition {
    return {
        kind: StatementKind.FunctionDefinition,
        name,
        expression: curryFunction(params, body),
    };
}

export function makeLambda(head: string, body: Expression): Lambda {
    return {
        kind: ExpressionKind.Lambda,
        head,
        body,
    };
}

export function makeLet(statement: Statement, expression: Expression): Let {
    return {
        kind: ExpressionKind.Let,
        variable: statement.name,
        initializer: statement.expression,
        body: expression,
    };
}

export function makeApplication(callee: Expression, argument: Expression): Application {
    return {
        kind: ExpressionKind.Application,
        callee,
        argument,
    };
}

export function makeCall(callee: Expression, args: Expression[]): Application {
    return curryApplication(callee, args);
}

type CallChainElement = [unknown, Expression[]];

export function buildCallChain(head: Application, tail: CallChainElement[]): Expression {
    return tail.reduce(
        (acc: Application, element: CallChainElement): Application => curryApplication(acc, element[1]),
        head,
    );
}

export type BinaryChainElement = [unknown, string, unknown, Expression];

export function buildBinaryExpressionChain(head: Expression, tail: BinaryChainElement[]): Expression {
    return tail.reduce(
        (acc: Expression, element): Expression => makeApplication(
            makeApplication(makeIdentifierReference(element[1]), acc),
            element[3],
        ),
        head,
    );
}

export type PipelineElement = [unknown, string, unknown, Expression];

export function buildPipeline(head: Expression, tail: PipelineElement[]): Expression {
    return tail.reduce(
        (pipeline: Expression, element: PipelineElement) => makeApplication(
            element[3],
            pipeline,
        ),
        head,
    );
}

/**
 * Transforms a function taking multiple arguments into a sequence of functions that
 * each take a single argument (e.g., (a, b) -> c is transformed into a -> (b -> c))
 *
 * @param params The function's parameter list.
 * @param body The function's body.
 */
function curryFunction(params: string[], body: Expression): Lambda {
    const [head, ...rest] = params;
    const lambdaBody = rest.length ? curryFunction(rest, body) : body;
    return makeLambda(head, lambdaBody);
}

/**
 * Transforms an application taking many arguments into a sequence of applications each taking (binding)
 * a single arguments.
 *  (e.g., f(a,b,c) is transformed into f(a)(b)(c))
 *
 * @param callee The applied expression.
 * @param args The arguments of the call.
 */
function curryApplication(callee: Expression, args: Expression[]): Application {
    const [head, ...rest] = args;
    const current: Application = makeApplication(callee, head);
    return rest.length ? curryApplication(current, rest) : current;
}
