import { freeTypeVars, show, Type } from './types';
import { composeSubstitutions, substituteInType, Substitution } from './substitution';

export function unify(t1: Type, t2: Type): Substitution {
	if (t1.kind === 'int' && t2.kind === 'int') {
		return {};
	} else if (t1.kind === 'boolean' && t2.kind === 'boolean') {
		return {};
	} else if (t1.kind === 'function' && t2.kind === 'function') {
		const s1 = unify(t1.input, t2.input);
		const s2 = unify(substituteInType(s1, t1.output), substituteInType(s1, t2.output));
		return composeSubstitutions(s1, s2);
	} else if (t1.kind === 'variable') {
		return bindToVar(t1.name, t2);
	} else if (t2.kind === 'variable') {
		return bindToVar(t2.name, t1);
	} else {
		throw new UnificationError(`Unification error: ${show(t1)} with ${show(t2)}`);
	}
}

function bindToVar(typeVarName: string, type: Type): Substitution {
	if (type.kind === 'variable' && typeVarName === type.name) {
		return {};
	} else if (freeTypeVars(type).has(typeVarName)) {
		throw new OccursError(`Occurs check failed: ${typeVarName} appears in ${type}`);
	} else {
		return { [typeVarName]: type };
	}
}

export class OccursError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export class UnificationError extends Error {
	constructor(message: string) {
		super(message);
	}
}