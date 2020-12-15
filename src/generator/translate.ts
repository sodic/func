import {
    Application,
    Conditional,
    Expression,
    ExpressionKind,
    Lambda, Let,
    Literal,
    LiteralKind,
} from '../ast/expressions';
import { BuiltinName } from '../builtins';
import { assertUnreachable } from '../util';
import { validJsName } from './names';


export function translateExpression(e: Expression, depth = 1): string {
    return invokeWrapped(translateExpressionWrapped(e, depth));
}

export function translateExpressionWrapped(e: Expression, depth = 1): Code {
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
    const thenCode = translateExpression(thenBranch, depth + 1);
    const elseCode = translateExpression(elseBranch, depth + 1);

    return wrappedLines(
        'function () {',
        `${indent(depth)}if (${conditionCode}) {`,
        `${indent(depth + 1)}return ${thenCode};`,
        `${indent(depth + 1)}return ${elseCode};`,
        `${indent(depth)}}`,
        '}',
    );
}

function translateLet(letExpression: Let, depth: number): Code {
    const { variable, initializer, body } = letExpression;

    const initCode = translateExpression(initializer, depth+1);
    const bodyCode = translateExpression(body, depth);

    return wrappedLines('function() {',
        `${indent(depth)}const ${validJsName(variable)} = ${initCode};`,
        `${indent(depth)}return ${bodyCode};`,
        '}',
    );
}

function translateLambda(lambda: Lambda, depth: number): Code {
    const { head, body } = lambda;
    const bodyCode = translateExpressionWrapped(body, depth + 1);

    if (bodyCode.kind === CodeKind.Wrapped) {
        return clean(bodyCode.code);
    }

    return cleanLines(
        `function(${validJsName(head)}) {`,
        `${indent(depth)}return ${bodyCode};`,
        '}',
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

    return clean(`${arg1Code} ${operator.name} ${arg2Code}`);
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

function invokeWrapped(code: Code): string {
    return code.kind === CodeKind.Clean ? code.code : `(${code.code}())`;
}

function indent(depth: number) {
    const indentation = '    ';
    return indentation.repeat(depth);
}

enum CodeKind {
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

function cleanLines(...code: string[]) {
    return clean(code.join('\n'));
}

function wrappedLines(...code: string[]) {
    return wrapped(code.join('\n'));
}

function clean(code: string): CleanCode {
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

type Code = CleanCode | WrappedCode;

interface BinOpPartialApplication extends Application {
    callee: {
        kind: ExpressionKind.Identifier;
        name: BuiltinName;
    };
}

interface BinOpApplication extends Application {
    callee: BinOpPartialApplication;
}