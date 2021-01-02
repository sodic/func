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
    ArrayLiteral,
} from '../../ast';
import { Constructor, TFunction, TVariable, Type } from '../types/type';
import { BIGINT_TYPE, BOOL_TYPE, NUMBER_TYPE, STRING_TYPE } from '../types/common';
import { functionType, polymorphicType, unboundScheme } from '../types/builders';
import { composeSubstitutions, EMPTY_SUBSTITUTION, substituteInContext, substituteInType } from '../substitution';
import { unify } from '../unification';
import { assertUnreachable } from '../../util';
import { instantiate, typeVarGenerator } from './helpers';
import { Context } from '../types/context';

export type ExpressionInferrer = (ctx: Context, expr: Expression) => TypeInfo;

export function inferExpression(expression: Expression, context: Context = {}): TypeInfo {
    // we don't want to pollute the global context with local type variables
    const infer = getExpressionInferer();
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
export function getExpressionInferer(uniqueTypeVar: () => TVariable = typeVarGenerator()): ExpressionInferrer {
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
            assertUnreachable(expression);
        }
    }

    function inferLiteral(context: Context, literal: Literal): TypeInfo {
        switch (literal.value.kind) {
        case LiteralKind.Number:
            return { substitution: EMPTY_SUBSTITUTION, type: NUMBER_TYPE };
        case LiteralKind.Boolean:
            return { substitution: EMPTY_SUBSTITUTION, type: BOOL_TYPE };
        case LiteralKind.String:
            return { substitution: EMPTY_SUBSTITUTION, type: STRING_TYPE };
        case LiteralKind.BigInt:
            return { substitution: EMPTY_SUBSTITUTION, type: BIGINT_TYPE };
        case LiteralKind.Array:
            return inferArrayLiteral(literal.value);
        default:
            assertUnreachable(literal.value);
        }

        function inferArrayLiteral(literal: ArrayLiteral): TypeInfo {
            const initialPreset = {
                substitution: EMPTY_SUBSTITUTION,
                type: uniqueTypeVar(),
            };
            const typeInfo = literal.contents.reduce(
                (presetAcc: TypeInfo, curr) => inferUsingPreset(presetAcc, context, curr),
                initialPreset,
            );
            return {
                substitution: typeInfo.substitution,
                type: polymorphicType(Constructor.Array, [typeInfo.type]),
            };
        }
    }

    function inferVariable(context: Context, variable: Identifier): TypeInfo {
        const scheme = context[variable.name];
        if (!scheme) {
            throw Error(`Unbound variable ${variable.name}`);
        }
        return {
            substitution: EMPTY_SUBSTITUTION,
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

        const { substitution: s3, type: branchType } = inferAndUnify(contextAfterCond, thenBranch, elseBranch);

        return {
            substitution: composeSubstitutions(s1, s2, s3),
            type: branchType,
        };
    }

    function inferAndUnify(context: Context, e1: Expression, e2: Expression): TypeInfo {
        return inferUsingPreset(infer(context, e1), context, e2);
    }

    function inferUsingPreset(preset: TypeInfo, context: Context, expression: Expression) {
        const { substitution: s1, type: t1 } = preset;
        const { substitution: s2, type: t2 } = infer(substituteInContext(s1, context), expression);

        // todo check unification
        // is it supposed to return a substitution that should be applied to the first type
        // if so, there's a mistake here:
        // https://github.com/namin/spots/blob/309286c2eb63181069f2ae707e07e8a9dbff7eb3/pcf/type.sml#L119
        const s3 = unify(t2, substituteInType(s2, t1));
        return {
            substitution: composeSubstitutions(s1, s2, s3),
            type: substituteInType(s3, t2),
        };
    }

    return infer;
}

interface TypeInfo<ExpressionType = Type> {
    type: ExpressionType;
    substitution: {
        [variableName: string]: Type;
    };
}
