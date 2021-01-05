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
import { NonEmpty } from '../util';

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

export function makeArray(...parts: ArrayPart[]): Expression {
    return isRegularArrayLiteral(parts) ? makeArrayLiteral(parts) : makeArraySpread(parts);
}

export function makePolymorphicTypeLiteral(constructor: string, parameters: NonEmpty<Expression[]>): Application {
    return makeCall(makeIdentifierReference(constructor), parameters);
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
        expression: makeCurriedLambda(params, body),
    };
}

export function makeLambda(head: string, body: Expression): Lambda {
    return {
        kind: ExpressionKind.Lambda,
        head,
        body,
    };
}

/**
 * Transforms a function taking multiple arguments into a sequence of functions that
 * each take a single argument (e.g., (a, b) -> c is transformed into a -> (b -> c))
 *
 * @param params The function's parameter list.
 * @param body The function's body.
 */
export function makeCurriedLambda(params: string[], body: Expression): Lambda {
    const [head, ...rest] = params;
    const lambdaBody = rest.length ? makeCurriedLambda(rest, body) : body;
    return makeLambda(head, lambdaBody);
}

export function makeLet(statement: Statement, expression: Expression): Let {
    return {
        kind: ExpressionKind.Let,
        variable: statement.name,
        initializer: statement.expression,
        body: expression,
    };
}

export function buildLetChain(statements: Statement[], expression: Expression): Expression {
    return statements.reduceRight(
        (acc, statement) => makeLet(
            statement,
            acc,
        ),
        expression,
    );
}

export function makeApplication(callee: Expression, argument: Expression): Application {
    return {
        kind: ExpressionKind.Application,
        callee,
        argument,
    };
}

export function makeCall(callee: Expression, args: NonEmpty<Expression[]>): Application {
    return curryApplication(callee, args);
}

export function makeOperatorBindingBare(operator: Identifier): Lambda {
    return makeLambda(
        OPERATOR_BINDING_PARAM_1,
        makeLambda(
            OPERATOR_BINDING_PARAM_2,
            makeCall(
                operator,
                [
                    makeIdentifierReference(OPERATOR_BINDING_PARAM_1),
                    makeIdentifierReference(OPERATOR_BINDING_PARAM_2),
                ],
            ),
        ),
    );
}

export function makeOperatorBindingLeft(operator: Identifier, leftArg: Expression): Lambda {
    return makeLambda(
        OPERATOR_BINDING_PARAM,
        makeCall(
            operator,
            [
                leftArg,
                makeIdentifierReference(OPERATOR_BINDING_PARAM),
            ],
        ),
    );
}

export const OPERATOR_BINDING_PARAM = '$op';

export const OPERATOR_BINDING_PARAM_1 = `${OPERATOR_BINDING_PARAM}1`;

export const OPERATOR_BINDING_PARAM_2 = `${OPERATOR_BINDING_PARAM}2`;

export function makeOperatorBindingRight(operator: Identifier, rightArg: Expression): Lambda {
    return makeLambda(
        OPERATOR_BINDING_PARAM,
        makeCall(
            operator,
            [
                makeIdentifierReference(OPERATOR_BINDING_PARAM),
                rightArg,
            ],
        ),
    );
}

type CallChainElement = [unknown, Expression[]];

export function buildCallChain(head: Application, tail: CallChainElement[]): Expression {
    return tail.reduce(
        (acc: Application, element: CallChainElement): Application => curryApplication(acc, element[1]),
        head,
    );
}

export type ChainElement = [unknown, Identifier, unknown, Expression];

export function buildBinaryExpressionChain(head: Expression, tail: ChainElement[]): Expression {
    return tail.reduce(
        (acc: Expression, element): Expression => makeApplication(
            makeApplication(element[1], acc),
            element[3],
        ),
        head,
    );
}

export function buildPipeline(head: Expression, tail: ChainElement[]): Expression {
    return tail.reduce(
        (pipeline: Expression, element: ChainElement) => makeApplication(
            element[3],
            pipeline,
        ),
        head,
    );
}

export const COMPOSITION_PARAM = '$comp';

export function buildComposition(head: Expression, tail: ChainElement[]): Expression {
    if (!tail.length) {
        return head;
    }

    const argRef = makeIdentifierReference(COMPOSITION_PARAM);
    const applicationChain = [...tail].reverse();
    const pipeline = makeApplication(head, buildPipeline(argRef, applicationChain));

    return makeLambda(COMPOSITION_PARAM, pipeline);
}

function makeArrayLiteral(expressions: Expression[]): Literal {
    return {
        kind: ExpressionKind.Literal,
        value: {
            kind: LiteralKind.Array,
            contents: expressions,
        },
    };
}

function makeArraySpread(parts: ArrayPart[]): Expression {
    const [head, ...tail] = groupArray(parts).reverse();
    return tail.reduce(
        (acc: Expression, part) => makeCall(
            makeIdentifierReference('concat'), // todo can't import name because of const enum
            [part, acc],
        ),
        head,
    );
}

/**
 * Groups non-spread parts of the array under the same array literal.
 * I.e., it turns [a, b, c*, d, *e, f, g, h, *i] into [[a, b], c, [d], e, [f, g, h], i]
 */
function groupArray(parts: ArrayPart[]): Expression[] {
    const result: Expression[] = [];
    let currentGroup: Expression[] = [];

    parts.forEach(part => {
        if (isSpreadPart(part))  {
            result.push(makeArray(...currentGroup), toArray(part));
            currentGroup = [];
        } else {
            currentGroup.push(part);
        }
    });

    return result.concat(makeArray(...currentGroup));
}

type ArraySpreadPart = ['*', Expression];
type ArrayPart = Expression | ArraySpreadPart;

function isSpreadPart(part: ArrayPart): part is ArraySpreadPart {
    return Array.isArray(part);
}

function isRegularArrayLiteral(parts: ArrayPart[]): parts is Expression[] {
    return !parts.some(isSpreadPart);
}

function toArray(part: ArrayPart): Expression {
    return isSpreadPart(part) ? part[1] : makeArrayLiteral([part]);
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
