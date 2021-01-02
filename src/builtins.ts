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
    Tuple2 = ',',
    Tuple3 = ',,',
    Tuple4 = ',,,',
    Tuple5 = ',,,,',

    // functions
    Constant= 'const',
    Identity = 'id',
    ToString = 'toString',
    SquareRoot = 'sqrt',
    First = 'first',
    Second = 'second',
    ExtendArray = 'extend',
    Head = 'head',
    Tail = 'tail',
    IsEmpty = 'isEmpty',
    Concat = 'concat',
    Map = 'map',
    Filter = 'filter',
    Reduce = 'reduce',
    Reduce0 = 'reduce0',
    Join = 'join',
    Length = 'length',
}

export function isBuiltinName(name: string | BuiltinName): name is BuiltinName {
    return Object.values(BuiltinName).includes(name as BuiltinName);
}
