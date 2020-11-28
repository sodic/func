// import * as Lambda from '../typeChecker/expressions';
// import * as Ast from './ast/expressions';
// import { makeLambdaExpression } from '../typeChecker/expressions';

// export function astToLambdaTree(expression: Ast.Expression): Lambda.Expression {
//     switch (expression.kind) {
//     case 'literal':
//         return expression;
//     case 'function':
//         return curry(expression.params, expression.body);
//     case 'if':
//         return {
//             kind: 'conditional',
//             condition: astToLambdaTree(expression.condition),
//             thenBranch: astToLambdaTree(expression.thenBranch),
//             elseBranch: astToLambdaTree(expression.elseBranch),
//         };
//     default:
//         // todo finish if needed
//         // assertUnreachable(expression);
//         return expression;
//     }
// }

/**
 * Transforms a function taking multiple arguments into a sequence of functions that
 * each take a single argument (e.g., (a, b) -> c is transformed into a -> (b -> c))
 *
 * @param params The function's parameter list.
 * @param body The function's body.
 */
// function curry(params: string[], body: Ast.Expression): Lambda.Lambda {
//     const [head, ...rest] = params;
//     const lambdaBody = rest ? curry(rest, body) : astToLambdaTree(body);
//     return makeLambdaExpression(head, lambdaBody);
// }