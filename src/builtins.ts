export enum BuiltinName {
    // operators
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    Divide = '/',
    Modulus = '%',
    GreaterThan = '>',
    GreaterEqualThan = '>=',
    LessThan = '<',
    LessEqualThan = '<=',
    Equal = '==',
    NotEqual = '!=',
    And = 'and',
    Or = 'or',
    Not = '!',
    Tuple = ',',

    // functions
    Constant= 'const',
    Identity = 'id',
    ToString = 'toString',
    SquareRoot = 'sqrt',
}

export function isBuiltinName(name: string | BuiltinName): name is BuiltinName {
    return Object.values(BuiltinName).includes(name as BuiltinName);
}
