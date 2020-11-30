export type Expression = Literal
    | Identifier
    | FunctionExpression
    | Call
    | Conditional;

export const enum ExpressionKind {
    Function = 'Function',
    Call = 'Call',
    Identifier = 'Identifier',
    Conditional = 'Conditional',
    Literal = 'Literal'
}

export const enum LiteralKind {
    BigInt = 'BigInt',
	Boolean = 'Boolean',
    Number = 'Number'
}

export interface BigintLiteral {
    kind: LiteralKind.BigInt;
    value: bigint;
}

export interface Literal {
    kind: ExpressionKind.Literal;
    value: BooleanLiteral | BigintLiteral | NumberLiteral;
}

export interface BooleanLiteral {
    kind: LiteralKind.Boolean;
    value: boolean;
}

export interface NumberLiteral {
    kind: LiteralKind.Number;
    value: number;
}

export interface Identifier {
    kind: ExpressionKind.Identifier;
    name: string;
}

export interface FunctionExpression {
    kind: ExpressionKind.Function;
    name: string;
    params: string[];
    body: Expression;
}

export interface Call {
    kind: ExpressionKind.Call;
    callee: Expression;
    arguments: Expression[];
}

export interface Conditional {
    kind: ExpressionKind.Conditional;
    condition: Expression;
    thenBranch: Expression;
    elseBranch: Expression;
}

