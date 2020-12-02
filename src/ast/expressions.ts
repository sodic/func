export type Expression = Literal
    | Identifier
    | Lambda
    | Application
    | Conditional
    | Let;

export const enum ExpressionKind {
    Literal = 'Literal',
    Identifier = 'Identifier',
    Lambda = 'Lambda',
    Application = 'Application',
    Conditional = 'Conditional',
    Let = 'Let',
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

export interface Lambda {
    kind: ExpressionKind.Lambda;
    // todo see what to do with named functions
    name?: string;
    head: string;
    body: Expression;
}

export interface Application {
    kind: ExpressionKind.Application;
    callee: Expression;
    argument: Expression;
}

export interface Conditional {
    kind: ExpressionKind.Conditional;
    condition: Expression;
    thenBranch: Expression;
    elseBranch: Expression;
}

export interface Let {
    kind: ExpressionKind.Let;
    variable: string;
    initializer: Expression;
    body: Expression;
}
