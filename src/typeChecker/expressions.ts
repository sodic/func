export interface IntLiteral {
	kind: 'int';
	value: number;
}

export interface BooleanLiteral {
	kind: 'boolean';
	value: boolean;
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
	value: IntLiteral | BooleanLiteral;
}

export type Expression = Literal
	| Variable
	| Application
	| Lambda
	| Let;
