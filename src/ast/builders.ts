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
    Literal,
    LiteralKind,
} from './expressions';
import { Assignment, Module, Statement, StatementKind } from './statements';

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

export function makeAssignment(name: string, expression: Expression): Assignment {
    return {
        kind: StatementKind.Assignment,
        name,
        expression,
    };
}

export function makeModule(definitions: Statement[]): Module {
    return {
        kind: 'module',
        definitions,
    };
}

export function makeFunctionDefinition(name: string, params: string[], body: Expression): Assignment {
    return {
        kind: StatementKind.Assignment,
        name,
        expression: curryFunction(params, body),
    };
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

function makeLambda(head: string, body: Expression): Lambda {
    return {
        kind: ExpressionKind.Lambda,
        head,
        body,
    };
}

type CallChainElement = [unknown, Expression[]];
export function buildCallChain(head: Application, tail: CallChainElement[]): Expression {
    return tail.reduce(
        (acc: Application, element: CallChainElement): Application => curryApplication(acc, element[1]),
        head,
    );
}

type BinaryCainElement = [unknown, string, unknown, Expression];
export function buildBinaryExpressionChain(head: Expression, tail: BinaryCainElement[]): Expression {
    return tail.reduce(
        (acc: Expression, element): Expression => ({
            kind: ExpressionKind.Application,
            callee: makeApplication(makeIdentifierReference(element[1]), acc),
            argument: element[3],
        }),
        head,
    );
}

export function makeCall(callee: Expression, args: Expression[]): Application {
    return curryApplication(callee, args);
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

function makeApplication(callee: Expression, argument: Expression): Application {
    return {
        kind: ExpressionKind.Application,
        callee,
        argument,
    };
}
