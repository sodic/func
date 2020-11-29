export type Expression = Literal
    | IdentifierReference
    | FunctionExpression
    | Call
    | IfExpression;

export interface BigintLiteral {
    kind: 'bigint';
    value: bigint;
}

export interface Literal {
    kind: 'literal';
    value: BooleanLiteral | BigintLiteral | NumberLiteral;
}

export interface BooleanLiteral {
    kind: 'boolean';
    value: boolean;
}

export interface NumberLiteral {
    kind: 'number';
    value: number;
}

export interface IdentifierReference {
    kind: 'identifier';
    name: string;
}

export interface FunctionExpression {
    kind: 'function';
    name: string;
    params: string[];
    body: Expression;
}

export interface Call {
    kind: 'call';
    callee: Expression;
    arguments: Expression[];
}

export interface IfExpression {
    kind: 'if';
    condition: Expression;
    thenBranch: Expression;
    elseBranch: Expression;
}

