export type Expression = Literal
    | Variable
    | Application
    | Lambda
    | Let
    | Conditional;

export interface Literal {
    kind: 'literal';
    value: BooleanLiteral | BigintLiteral | NumberLiteral;
}

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

// extensions to the lambda calculus

export interface Let {
    kind: 'let';
    variable: string;
    initializer: Expression;
    body: Expression;
}

export interface Conditional {
    kind: 'conditional';
    condition: Expression;
    thenBranch: Expression;
    elseBranch: Expression;
}

export function makeLambdaExpression(head: string, body: Expression): Lambda {
    return {
        head,
        body,
        kind: 'lambda',
    };
}
