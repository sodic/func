export interface BigintLiteral {
    kind: 'bigint';
    value: bigint;
}

export interface BooleanLiteral {
    kind: 'boolean';
    value: boolean;
}

export interface NumberLiteral {
    kind: 'number';
    value: number;
}

export interface Application {
    kind: 'application';
    func: Expression;
    argument: Expression;
}

export interface Variable {
    kind: 'variable';
    name: string;
}

export interface Lambda {
    kind: 'lambda';
    head: string;
    body: Expression;
}

export interface Let {
    kind: 'let';
    variable: string;
    initializer: Expression;
    body: Expression;
}

export interface Literal {
    kind: 'literal';
    value: BooleanLiteral | BigintLiteral | NumberLiteral;
}

export type Expression = Literal
    | Variable
    | Application
    | Lambda
    | Let;
