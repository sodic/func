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
} from '../ast/expressions';
import {
    BIGINT_TYPE,
    BOOL_TYPE,
    Context,
    functionType,
    generalize,
    instantiate,
    NUMBER_TYPE,
    STRING_TYPE,
    TFunction,
    TLiteral,
    TVariable,
    Type,
    typeVar,
    typeVarGenerator,
    unboundScheme,
} from './types';
import { composeSubstitutions, substituteInContext, substituteInType } from './substitution';
import { unify } from './unification';
import { assertUnreachable } from '../util';
import { Module, Statement, StatementKind } from '../ast/statements';
import { builtins } from './builtins';


export function inferModule(module: Module): Context {
    return module.statements.reduce(
        inferStatement,
        builtins,
    );
}


export function inferStatement(context: Context, statement: Statement): Context {
    const { kind, name, expression } = statement;
    try {
        switch (kind) {
        case StatementKind.FunctionDefinition:
            return inferFunctionDefinition(context, name, expression);
        case StatementKind.Assignment:
            return inferAssignment(context, name, expression);
        default:
            assertUnreachable(kind);
        }
    } catch (e) {
        throw new Error(e.message + ` in ${name}`);
    }
}

function inferAssignment(context: Context, name: string, expression: Expression): Context {
    const { type } = inferExpression(expression, context);
    return {
        ...context,
        [name]: generalize(context, type),
    };

}

function inferFunctionDefinition(context: Context, name: string, body: Expression): Context {
    const contextWithSelfReference = {
        ...context,
        [name]: unboundScheme(typeVar('u1')),
    };

    const { substitution: sub1, type: expressionType } = inferExpression(body, contextWithSelfReference);
    const updatedContext = substituteInContext(sub1, contextWithSelfReference);

    const sub2 = unify(expressionType, instantiate(updatedContext[name]));
    const functionType = substituteInType(sub2, expressionType);
    return {
        ...updatedContext,
        [name]: generalize(context, functionType),
    };
}

export function inferExpression(expression: Expression, context: Context = {}): TypeInfo {
    const infer = getInferer(typeVarGenerator());
    // we don't want to pullute the global context with local type variables
    return infer(context, expression);
}

/**
 * Returns a Hindley-Milner type inference engine for expressions. The inference is done using
 * Algorithm W described in the original paper by Damas and Miler:
 * http://steshaw.org/hm/milner-damas.pdf
 *
 * @param uniqueTypeVar A function that provides a type variable with a unique name
 * within the system.
 */
export function getInferer(uniqueTypeVar: () => TVariable = typeVarGenerator()): ExpressionInferer {
    function infer(context: Context, expression: Expression): TypeInfo {
        switch (expression.kind) {
        case ExpressionKind.Literal:
            return inferLiteral(context, expression);
        case ExpressionKind.Identifier:
            return inferVariable(context, expression);
        case ExpressionKind.Lambda:
            return inferLambda(context, expression);
        case ExpressionKind.Let:
            return inferLet(context, expression);
        case ExpressionKind.Application:
            return inferApplication(context, expression);
        case ExpressionKind.Conditional:
            return inferConditional(context, expression);
        default:
            // helps the compiler check for exhaustiveness
            assertUnreachable(expression);
        }
    }

    function inferLiteral(context: Context, literal: Literal): TypeInfo<TLiteral> {
        switch (literal.value.kind) {
        case LiteralKind.Number:
            return { substitution: {}, type: NUMBER_TYPE };
        case LiteralKind.Boolean:
            return { substitution: {}, type: BOOL_TYPE };
        case LiteralKind.BigInt:
            return { substitution: {}, type: BIGINT_TYPE };
        case LiteralKind.String:
            return { substitution: {}, type: STRING_TYPE };
        default:
            assertUnreachable(literal.value);
        }
    }

    function inferVariable(context: Context, variable: Identifier): TypeInfo {
        const scheme = context[variable.name];
        if (!scheme) {
            throw Error(`Unbound variable: ${variable.name}`);
        }
        return {
            substitution: {},
            type: instantiate(scheme, uniqueTypeVar),
        };
    }

    function inferLambda(context: Context, { head, body }: Lambda): TypeInfo<TFunction> {
        const headType = uniqueTypeVar();

        const temporaryContext: Context = {
            ...context,
            [head]: unboundScheme(headType),
        };
        const { substitution, type: bodyType  } = infer(temporaryContext, body);

        return {
            substitution,
            type: functionType(substituteInType(substitution, headType), bodyType),
        };
    }

    function inferLet(context: Context, { variable, initializer, body }: Let): TypeInfo {
        const { substitution: sub1, type: initializerType } = infer(context, initializer);
        const tempContext: Context = {
            ...context,
            [variable]: unboundScheme(initializerType),
        };
        const subbedContext = substituteInContext(sub1, tempContext);
        const { substitution: sub2, type: typeOfBody } = infer(subbedContext, body);
        return {
            substitution: composeSubstitutions(sub1, sub2),
            type: typeOfBody,
        };
    }

    function inferApplication(context: Context, { callee, argument }: Application): TypeInfo {
        const { substitution: s1, type: funcType } = infer(context, callee);
        const { substitution: s2, type: argType } = infer(substituteInContext(s1, context), argument);

        const resultType = uniqueTypeVar();
        const inferredType: TFunction = functionType(argType, resultType);

        const s3 = unify(substituteInType(s2, funcType), inferredType);
        const composition = composeSubstitutions(s1, s2, s3);

        return {
            substitution: composition,
            type: substituteInType(s3, resultType),
        };
    }

    function inferConditional(context: Context, conditional: Conditional): TypeInfo {
        const { condition, thenBranch, elseBranch } = conditional;

        const { substitution: s1, type: condType } = infer(context, condition);
        const s2 = unify(condType, BOOL_TYPE);
        const contextAfterCond = substituteInContext(composeSubstitutions(s1, s2), context);

        const { substitution: s3, type: thenType } = infer(contextAfterCond, thenBranch);
        const contextAfterThen = substituteInContext(s3, contextAfterCond);

        const { substitution: s4, type: elseType } = infer(contextAfterThen, elseBranch);

        // todo check unification, is it supposed to return a substitution that should be applied to the first type
        // if so, there's a mistake here: https://github.com/namin/spots/blob/309286c2eb63181069f2ae707e07e8a9dbff7eb3/pcf/type.sml#L119
        const s5 = unify(elseType, substituteInType(s4, thenType));
        return {
            substitution: composeSubstitutions(s1, s2, s3, s4, s5),
            type: substituteInType(s5, elseType),
        };
    }

    return infer;
}

export type ExpressionInferer = (ctx: Context, expr: Expression) => TypeInfo;

interface TypeInfo<ExpressionType = Type> {
    type: ExpressionType;
    substitution: {
        [variableName: string]: Type;
    };
}
