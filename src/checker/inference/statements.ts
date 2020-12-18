import { assertUnreachable } from '../../util';
import { Expression, Statement, StatementKind } from '../../ast';
import { substituteInContext, substituteInType } from '../substitution';
import { unify } from '../unification';
import { inferExpression } from './expressions';
import { typeVar, unboundScheme } from '../types/builders';
import { generalize, instantiate } from './helpers';
import { Context } from '../types/context';

export function inferStatement(context: Context, statement: Statement): Context {
    const { kind, name, expression } = statement;

    if (name in context) {
        throw new NameError(`${name} was declared twice`);
    }

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
        throw new e.constructor(e.message + ` in definition of "${name}".`);
    }
}

function inferAssignment(context: Context, name: string, expression: Expression): Context {
    const type = inferExpression(expression, context).type;
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

class NameError extends Error {
    constructor(message: string) {
        super(message);
    }
}
