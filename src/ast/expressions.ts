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
    Number = 'Number',
    String = 'String',
}

export interface Literal extends PossiblyParenthesized {
    kind: ExpressionKind.Literal;
    value: BooleanLiteral
        | BigintLiteral
        | NumberLiteral
        | StringLiteral;
}

export interface BigintLiteral {
    kind: LiteralKind.BigInt;
    value: bigint;
}

export interface BooleanLiteral {
    kind: LiteralKind.Boolean;
    value: boolean;
}

export interface NumberLiteral {
    kind: LiteralKind.Number;
    value: number;
}

export interface StringLiteral {
    kind: LiteralKind.String;
    value: string;
}

export interface Identifier extends PossiblyParenthesized {
    kind: ExpressionKind.Identifier;
    name: string;
}

export interface Lambda extends PossiblyParenthesized {
    kind: ExpressionKind.Lambda;
    // todo see what to do with named functions
    name?: string;
    head: string;
    body: Expression;
}

export const enum ApplicationKind {
    BinaryOperator= 'BinaryOperator',
    UnaryOperator = 'UnaryOperator',
    Regular = 'Regular',
}

export type Application = RegularApplication
    | BinaryOpApplication
    | UnaryOpApplication;

export interface RegularApplication extends ApplicationBase {
    applicationKind: ApplicationKind.Regular;
}

export interface BinaryOpApplication extends ApplicationBase {
    applicationKind: ApplicationKind.BinaryOperator;
    callee: Identifier;
    argument: Expression;
}

export interface UnaryOpApplication extends ApplicationBase {
    applicationKind: ApplicationKind.UnaryOperator;
    callee: Identifier;
    argument: Expression;
}

export interface Conditional extends PossiblyParenthesized {
    kind: ExpressionKind.Conditional;
    condition: Expression;
    thenBranch: Expression;
    elseBranch: Expression;
}

export interface Let extends PossiblyParenthesized {
    kind: ExpressionKind.Let;
    variable: string;
    initializer: Expression;
    body: Expression;
}

export interface PossiblyParenthesized {
    parentheses?: true;
}

interface ApplicationBase extends PossiblyParenthesized {
    kind: ExpressionKind.Application;
    callee: Expression;
    argument: Expression;
}
