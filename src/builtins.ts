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
    And = '&&',
    Or = '||',
    Not = '!',
    Tuple2 = ',',
    Tuple3 = ',,',
    Tuple4 = ',,,',
    Tuple5 = ',,,,',

    // compiled away to function calls when used normally, preserved only in operators binding
    Compose = '.',
    Pipe = '|>',

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
    Concat = '++',
    Map = 'map',
    Filter = 'filter',
    Reduce = 'reduce',
    Reduce0 = 'reduce0',
    Join = 'join',
    Length = 'length',
    ToLower = 'lower',
    ToUpper = 'upper',
}

export function isBuiltinName(name: string | BuiltinName): name is BuiltinName {
    return Object.values(BuiltinName).includes(name as BuiltinName);
}
