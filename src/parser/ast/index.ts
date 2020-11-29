import { Expression } from './expressions';

export type Ast = Module;

export interface FlatModule {
	definitions: [];
}

export interface Module {
	definition: Definition;
	module: Module;
}

export type Definition = Assignment
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

