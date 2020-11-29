import { Expression } from './expressions';

export interface Module {
	kind: 'module';
	definitions: Statement[];
}

export type Statement = Assignment
	| FunctionDefinition;

export type Assignment = {
	kind: 'assignment';
	name: string;
	expression: Expression;
};

export type FunctionDefinition = {
	kind: 'function';
	name: string;
	params: string[];
	body: Expression;
};

