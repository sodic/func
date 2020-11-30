// import * as Lambda from './expressions';
// import { ExpressionKind, makeLambdaExpression } from './expressions';
// import * as Ast from '../parser/ast/expressions';
// import { assertUnreachable } from '../util';
//
// /**
//  * Maps a parser generated expression AST into a lambda calculus tree to make
//  * type inference possible
//  * @param expression The root expression of the AST.
//  */
// export function astToLambdaTree(expression: Ast.Expression): Lambda.Expression {
//     switch (expression.kind) {
//     case Ast.ExpressionKind.Literal:
//         return mapLiteral(expression);
//     case Ast.ExpressionKind.Identifier:
//         return {
//             kind: Lambda.ExpressionKind.Identifier,
//             name: expression.name,
//         };
//     case Ast.ExpressionKind.Function:
//         return curryFunction(expression.params, expression.body);
//     case Ast.ExpressionKind.Call:
//         return curryApplication(astToLambdaTree(expression.callee), expression.arguments);
//     case Ast.ExpressionKind.Conditional:
//         return {
//             kind: Lambda.ExpressionKind.Conditional,
//             condition: astToLambdaTree(expression.condition),
//             thenBranch: astToLambdaTree(expression.thenBranch),
//             elseBranch: astToLambdaTree(expression.elseBranch),
//         };
//     default:
//         assertUnreachable(expression);
//     }
// }
//
// function mapLiteral(literal: Ast.Literal): Lambda.Literal {
//     const kindMap: Record<Ast.LiteralKind, Lambda.LiteralKind> = {
//         [Ast.LiteralKind.Boolean]: Lambda.LiteralKind.Boolean,
//         [Ast.LiteralKind.Number]: Lambda.LiteralKind.Number,
//         [Ast.LiteralKind.BigInt]: Lambda.LiteralKind.BigInt,
//     };
//     return {
//         kind: ExpressionKind.Literal,
//         value: {
//             kind: kindMap[literal.value.kind],
//             value: literal.value.value,
//         },
//     };
// }
//
// /**
//  * Transforms a function taking multiple arguments into a sequence of functions that
//  * each take a single argument (e.g., (a, b) -> c is transformed into a -> (b -> c))
//  *
//  * @param params The function's parameter list.
//  * @param body The function's body.
//  */
// function curryFunction(params: string[], body: Ast.Expression): Lambda.Lambda {
//     const [head, ...rest] = params;
//     const lambdaBody = rest.length ? curryFunction(rest, body) : astToLambdaTree(body);
//     return makeLambdaExpression(head, lambdaBody);
// }
//
// /**
//  * Transforms an application taking many arguments into a sequence of applications each taking (binding)
//  * a single arguments.
//  *  (e.g., f(a,b,c) is transformed into f(a)(b)(c))
//  *
//  * @param callee The applied expression.
//  * @param args The arguments of the call.
//  */
// function curryApplication(callee: Lambda.Expression, args: Ast.Expression[]): Lambda.Application {
//     const [head, ...rest] = args;
//     const current: Lambda.Application = {
//         kind: Lambda.ExpressionKind.Application,
//         func: callee,
//         argument: astToLambdaTree(head),
//     };
//     return rest ? curryApplication(current, rest) : current;
// }
