import { Expression } from './expressions';

export interface Module {
	kind: 'module';
	definitions: Statement[];
}

export const enum StatementKind {
	Assignment = 'Assignment',
	FunctionDefinition = 'FunctionDefinition',
}

export type Statement = Assignment
	| FunctionDefinition;

export type Assignment = {
	kind: StatementKind.Assignment;
	name: string;
	expression: Expression;
};

export type FunctionDefinition = {
	kind: StatementKind.FunctionDefinition;
	name: string;
	params: string[];
	body: Expression;
};
