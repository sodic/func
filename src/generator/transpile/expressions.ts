import {
    Application,
    Conditional,
    Expression,
    ExpressionKind,
    Lambda,
    Let,
    Literal,
    LiteralKind,
} from '../../ast';
import { BuiltinName } from '../../builtins';
import { assertUnreachable } from '../../util';
import { validJsName } from '../names';
import { indent } from './helpers';

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
        case LiteralKind.String:
            return `'${value.value}'`;
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

    return wrappedLines('function() {',
        `${indent(depth + 1)}const ${validJsName(variable)} = ${initCode};`,
        `${indent(depth + 1)}return ${bodyCode};`,
        `${indent(depth)}}`,
    );
}

function transpileLambda(lambda: Lambda, depth: number): Code {
    const { head, body } = lambda;
    const bodyCode = transpileExpression(body, depth + 1);

    return cleanLines(
        `function(${validJsName(head)}) {`,
        `${indent(depth + 1)}return ${bodyCode};`,
        `${indent(depth)}}`,
    );
}

function transpileApplication(application: Application, depth: number): Code {
    return isBinOpApplication(application) ?
        transpileOperatorCall(application, depth) : transpileRegularCall(application, depth);
}

function transpileOperatorCall(application: BinOpApplication, depth: number): Code {
    const { argument: arg2, callee: partialCall } = application;
    const { argument: arg1, callee: operator } = partialCall;

    const arg1Code = transpileExpression(arg1, depth + 1);
    const arg2Code = transpileExpression(arg2, depth + 1);

    const expressionCode = `${arg1Code} ${operator.name} ${arg2Code}`;
    const code = application.parentheses ? `(${expressionCode})` : expressionCode;

    return clean(code);
}

function transpileRegularCall(application: Application, depth: number): Code {
    const { callee, argument } = application;

    const calleeCode = transpileExpression(callee, depth + 1);
    const argCode = transpileExpression(argument, depth + 1);

    return clean(`${calleeCode}(${argCode})`);
}

function isOperatorPartialApplication(application: Application): application is BinOpPartialApplication {
    const { callee } = application;
    return callee.kind === ExpressionKind.Identifier
        && Object.values(BuiltinName).includes(callee.name as BuiltinName);
}

function isBinOpApplication(application: Application): application is BinOpApplication {
    const { callee } = application;
    return callee.kind === ExpressionKind.Application && isOperatorPartialApplication(callee);
}

interface BinOpPartialApplication extends Application {
    callee: {
        kind: ExpressionKind.Identifier;
        name: BuiltinName;
    };
}

interface BinOpApplication extends Application {
    callee: BinOpPartialApplication;
}
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
