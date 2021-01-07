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
} from '../../ast';
import { assertUnreachable } from '../../util';
import { validJsName } from './names';
import { indent } from './helpers';
import {
    isBinaryOperator,
    isUnaryOperator,
} from './builtins';

export function transpileExpression(e: Expression, depth = 0): string {
    return invokeWrapped(transpileExpressionWrapped(e, depth));
}

export function transpileExpressionWrapped(e: Expression, depth = 0): Code {
    switch (e.kind)    {
    case ExpressionKind.Literal:
        return transpileLiteral(e);
    case ExpressionKind.Identifier:
        return clean(validJsName(e.name));
    case ExpressionKind.Conditional:
        return transpileConditional(e, depth);
    case ExpressionKind.Let:
        return transpileLet(e, depth);
    case ExpressionKind.Lambda:
        return transpileLambda(e, depth);
    case ExpressionKind.Application:
        return transpileApplication(e, depth);
    default:
        assertUnreachable(e);
    }
}

function transpileLiteral(literal: Literal): Code {
    const value = literal.value;
    return clean((() => {
        switch (value.kind) {
        case LiteralKind.Boolean:
            return String(value.value);
        case LiteralKind.BigInt:
            return String(value.value);
        case LiteralKind.Number:
            return String(value.value);
        case LiteralKind.Character:
        case LiteralKind.String:
            return `'${value.value}'`;
        case LiteralKind.Array:
            return `[${value.contents.map(transpileExpression).join(', ')}]`;
        default:
            assertUnreachable(value);
        }
    })());
}

function transpileConditional(conditional: Conditional, depth: number): Code {
    const { condition, thenBranch, elseBranch } = conditional;

    const conditionCode = transpileExpression(condition, depth + 1);
    const thenCode = transpileExpression(thenBranch, depth + 2);
    const elseCode = transpileExpression(elseBranch, depth + 2);

    return wrappedLines(
        'function () {',
        `${indent(depth + 1)}if (${conditionCode}) {`,
        `${indent(depth + 2)}return ${thenCode};`,
        `${indent(depth + 1)}} else {`,
        `${indent(depth + 2)}return ${elseCode};`,
        `${indent(depth + 1)}}`,
        `${indent(depth)}}`,
    );
}

function transpileLet(letExpression: Let, depth: number): Code {
    const { variable, initializer, body } = letExpression;

    const initCode = transpileExpression(initializer, depth+1);
    const bodyCode = transpileExpression(body, depth + 1);

    return wrappedLines('function () {',
        `${indent(depth + 1)}const ${validJsName(variable)} = ${initCode};`,
        `${indent(depth + 1)}return ${bodyCode};`,
        `${indent(depth)}}`,
    );
}

function transpileLambda(lambda: Lambda, depth: number): Code {
    const { head, body } = lambda;
    const bodyCode = transpileExpression(body, depth + 1);

    return cleanLines(
        `function (${validJsName(head)}) {`,
        `${indent(depth + 1)}return ${bodyCode};`,
        `${indent(depth)}}`,
    );
}

function transpileApplication(application: Application, depth: number): Code {
    if (shouldTranspileAsUnary(application))  {
        return transpileUnaryExpression(application, depth);

    } else if(shouldTranspileAsBinary(application)) {
        return transpileBinaryExpression(application, depth);

    } else {
        return transpileRegularCall(application, depth);
    }
}

function transpileUnaryExpression(application: TranspiledAsUnaryExpression, depth: number) {
    const { argument, callee: operator } = application;
    const argCode = transpileExpression(argument, depth + 1);
    return clean(`${validJsName(operator.name)}${argCode}`);
}

function transpileBinaryExpression(application: TranspiledAsBinaryExpression, depth: number): Code {
    const { argument: arg2, callee: partialCall } = application;
    const { argument: arg1, callee: operator } = partialCall;

    const arg1Code = transpileExpression(arg1, depth + 1);
    const arg2Code = transpileExpression(arg2, depth + 1);

    const expressionCode = `${arg1Code} ${validJsName(operator.name)} ${arg2Code}`;
    const code = application.parentheses ? `(${expressionCode})` : expressionCode;

    return clean(code);
}

function transpileRegularCall(application: Application, depth: number): Code {
    const { callee, argument } = application;

    const calleeCode = transpileExpression(callee, depth);
    const argCode = transpileExpression(argument, depth);

    return clean(`${calleeCode}(${argCode})`);
}

/**
 * Returns true if application is a unary operator call, false otherwise.
 * E.g., !False, +1, -2
 */
function shouldTranspileAsUnary(application: Application): application is TranspiledAsUnaryExpression {
    const callee = application.callee;
    return callee.kind === ExpressionKind.Identifier && isUnaryOperator(callee.name);
}

/**
 * Returns true if application is a full application of a binary operator, false otherwise
 * E.g., 1+2, 2*3, 3-1
 */
function shouldTranspileAsBinary(application: Application): application is TranspiledAsBinaryExpression {
    const callee = application.callee;
    if (callee.kind !== ExpressionKind.Application) {
        return false;
    }

    const firstCallee = callee.callee;
    if (firstCallee.kind !== ExpressionKind.Identifier) {
        return false;
    }

    return isBinaryOperator(firstCallee.name);
}

type TranspiledAsUnaryExpression = Application & {
    callee: Identifier;
};

type TranspiledAsBinaryExpression = Application & {
    callee:  Application & {
        callee: Identifier;
    };
};

export function invokeWrapped(code: Code): string {
    return code.kind === CodeKind.Clean ? code.code : `(${code.code}())`;
}

export enum CodeKind {
    Clean = 'Clean',
    Wrapped = 'Wrapped',
}

interface WrappedCode {
    kind: CodeKind.Wrapped;
    code: string;
}

interface CleanCode {
    kind: CodeKind.Clean;
    code: string;
}

export function cleanLines(...code: string[]): CleanCode {
    return clean(code.join('\n'));
}

export function wrappedLines(...code: string[]): WrappedCode {
    return wrapped(code.join('\n'));
}

export function clean(code: string): CleanCode {
    return {
        kind: CodeKind.Clean,
        code,
    };
}

function wrapped(code: string): WrappedCode {
    return {
        kind: CodeKind.Wrapped,
        code,
    };
}

export type Code = CleanCode | WrappedCode;
