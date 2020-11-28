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
	variable: Variable;
	expression: Expression;
};

type FunctionDefinition = {
	name: string;
	params: string[];
	body: Expression;
};

export type Variable = string;
