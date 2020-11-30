import {
    Application,
    Conditional,
    Expression,
    ExpressionKind,
    Lambda,
    Let,
    Literal,
    LiteralKind,
    Identifier,
} from './expressions';
import {
    BIGINT_TYPE,
    BOOL_TYPE,
    Context,
    functionType,
    instantiate,
    NUMBER_TYPE,
    TFunction,
    TLiteral,
    TVariable,
    Type,
    unboundScheme,
} from './types';
import { composeSubstitutions, substituteInContext, substituteInType } from './substitution';
import { unify } from './unification';
import { assertUnreachable } from '../util';

/**
 * Returns a Hindley-Milner type inference engine. The inference is done using
 * Algorithm W described in the original paper by Damas and Miler:
 * http://steshaw.org/hm/milner-damas.pdf
 *
 * @param uniqueTypeVar A function that provides a type variable with a unique name
 * within the system.
 */
export function getInferer(uniqueTypeVar: () => TVariable): Inferer {
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

    function inferApplication(context: Context, { func, argument }: Application): TypeInfo {
        const { substitution: s1, type: funcType } = infer(context, func);
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

        const s5 = unify(substituteInType(s4, thenType), elseType);
        return {
            substitution: composeSubstitutions(s1, s2, s3, s4, s5),
            type: substituteInType(s5, elseType),
        };
    }

    return infer;
}

export type Inferer = (ctx: Context, expr: Expression) => TypeInfo;

interface TypeInfo<ExpressionType = Type> {
    type: ExpressionType;
    substitution: {
        [variableName: string]: Type;
    };
}
