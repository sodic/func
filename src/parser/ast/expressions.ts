export type Expression = Literal
    | Variable
    | FunctionExpression
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

export interface Variable {
    kind: 'variable';
    name: string;
}

export interface FunctionExpression {
    kind: 'function';
    name: string;
    params: string[];
    body: Expression;
}

export interface FunctionCall {
    kind: 'call';
    functionName: string;
    arguments: Expression[];
}

export interface IfExpression {
    kind: 'if';
    condition: Expression;
    thenBranch: Expression;
    elseBranch: Expression;
}

