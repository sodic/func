import { Expression } from './expressions';

export interface Module {
	kind: 'module';
	definitions: Statement[];
}

export const enum StatementKind {
	Assignment = 'Assignment',
}

export type Statement = Assignment;

export type Assignment = {
	kind: StatementKind.Assignment;
	name: string;
	expression: Expression;
};

