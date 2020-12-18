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

export function translateExpression(e: Expression, depth = 0): string {
    return invokeWrapped(translateExpressionWrapped(e, depth));
}

export function translateExpressionWrapped(e: Expression, depth = 0): Code {
    switch (e.kind)	{
    case ExpressionKind.Literal:
        return translateLiteral(e);
    case ExpressionKind.Identifier:
        return clean(validJsName(e.name));
    case ExpressionKind.Conditional:
        return translateConditional(e, depth);
    case ExpressionKind.Let:
        return translateLet(e, depth);
    case ExpressionKind.Lambda:
        return translateLambda(e, depth);
    case ExpressionKind.Application:
        return translateApplication(e, depth);
    default:
        assertUnreachable(e);
    }
}

function translateLiteral(literal: Literal): Code {
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
            return value.value;
        default:
            assertUnreachable(value);
        }
    })());
}

function translateConditional(conditional: Conditional, depth: number): Code {
    const { condition, thenBranch, elseBranch } = conditional;

    const conditionCode = translateExpression(condition, depth + 1);
    const thenCode = translateExpression(thenBranch, depth + 2);
    const elseCode = translateExpression(elseBranch, depth + 2);

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

function translateLet(letExpression: Let, depth: number): Code {
    const { variable, initializer, body } = letExpression;

    const initCode = translateExpression(initializer, depth+1);
    const bodyCode = translateExpression(body, depth);

    return wrappedLines('function() {',
        `${indent(depth + 1)}const ${validJsName(variable)} = ${initCode};`,
        `${indent(depth + 1)}return ${bodyCode};`,
        `${indent(depth)}}`,
    );
}

function translateLambda(lambda: Lambda, depth: number): Code {
    const { head, body } = lambda;
    const bodyCode = translateExpression(body, depth + 1);

    return cleanLines(
        `function(${validJsName(head)}) {`,
        `${indent(depth + 1)}return ${bodyCode};`,
        `${indent(depth)}}`,
    );
}

function translateApplication(application: Application, depth: number): Code {
    return isBinOpApplication(application) ?
        translateOperatorCall(application, depth) : translateRegularCall(application, depth);
}

function translateOperatorCall(application: BinOpApplication, depth: number): Code {
    const { argument: arg2, callee: partialCall } = application;
    const { argument: arg1, callee: operator } = partialCall;

    const arg1Code = translateExpression(arg1, depth + 1);
    const arg2Code = translateExpression(arg2, depth + 1);

    const expressionCode = `${arg1Code} ${operator.name} ${arg2Code}`;
    const code = application.parentheses ? `(${expressionCode})` : expressionCode;

    return clean(code);
}

function translateRegularCall(application: Application, depth: number): Code {
    const { callee, argument } = application;

    const calleeCode = translateExpression(callee, depth + 1);
    const argCode = translateExpression(argument, depth + 1);

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
