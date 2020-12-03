export enum BuiltinOperator {
	Add = '+',
	Subtract = '-',
	Multiply = '*',
	Divide = '/',
	Modulus = '%',
	GreaterThan = '>',
	GreaterEqualThan = '>=',
	LessThan = '<',
	LessEqualThan = '<=',
	Equal= '==',
}

export enum BuiltinFunction {
	Constant= 'const',
	Identity = 'id',
}

export type Builtin = BuiltinOperator | BuiltinFunction;