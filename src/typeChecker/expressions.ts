export type Expression = Literal
    | Identifier
    | Application
    | Lambda
    | Let
    | Conditional;

export const enum ExpressionKind {
    Literal= 'Literal',
    Application = 'Application',
	Identifier = 'Identifier',
    Lambda = 'Lambda',
    Let = 'Let',
    Conditional = 'Conditional'
}

export enum LiteralKind {
    BigInt = 'BigInt',
    Boolean = 'Boolean',
    Number = 'Number',
}

export interface Literal {
    kind: ExpressionKind.Literal;
    value: BooleanLiteral | BigintLiteral | NumberLiteral;
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

export interface Application {
    kind: ExpressionKind.Application;
    func: Expression;
    argument: Expression;
}

export interface Identifier {
    kind: ExpressionKind.Identifier;
    name: string;
}

export interface Lambda {
    kind: ExpressionKind.Lambda;
    head: string;
    body: Expression;
}

// extensions to the lambda calculus

export interface Let {
    kind: ExpressionKind.Let;
    variable: string;
    initializer: Expression;
    body: Expression;
}

export interface Conditional {
    kind: ExpressionKind.Conditional;
    condition: Expression;
    thenBranch: Expression;
    elseBranch: Expression;
}

export function makeLambdaExpression(head: string, body: Expression): Lambda {
    return {
        head,
        body,
        kind: ExpressionKind.Lambda,
    };
}

export function makeVariableReference(name: string): Identifier {
    return {
        kind: ExpressionKind.Identifier,
        name,
    };
}
