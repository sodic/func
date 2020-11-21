import { Application, Expression, Lambda, Let, Literal, Variable } from './expressions';
import {
    BOOL_TYPE,
    Context,
    functionType, instantiate,
    BIGINT_TYPE,
    TFunction,
    TLiteral,
    TVariable,
    Type,
    unboundScheme, NUMBER_TYPE,
} from './types';
import { composeSubstitutions, substituteInContext, substituteInType } from './substitution';
import { unify } from './unification';
import { assertUnreachable } from './primitives';

export function getInferer(uniqueTypeVar: () => TVariable): Inferer {
    function infer(context: Context, expression: Expression): TypeInfo {
        switch (expression.kind) {
        case 'literal':
            return inferLiteral(context, expression);
        case 'variable':
            return inferVariable(context, expression);
        case 'lambda':
            return inferLambda(context, expression);
        case 'let':
            return inferLet(context, expression);
        case 'application':
            return inferApplication(context, expression);
        default:
            // helps the compiler check for exhaustiveness
            assertUnreachable(expression);
        }
    }

    function inferLiteral(context: Context, literal: Literal): TypeInfo<TLiteral> {
        switch (literal.value.kind) {
        case 'number':
            return { substitution: {}, type: NUMBER_TYPE };
        case 'boolean':
            return { substitution: {}, type: BOOL_TYPE };
        case 'bigint':
            return { substitution: {}, type: BIGINT_TYPE };
        default:
            assertUnreachable(literal.value);
        }
    }

    function inferVariable(context: Context, variable: Variable): TypeInfo {
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

    return infer;
}

export type Inferer = (ctx: Context, expr: Expression) => TypeInfo;

interface TypeInfo<ExpressionType = Type> {
	type: ExpressionType;
	substitution: { [variableName: string]: Type };
}
