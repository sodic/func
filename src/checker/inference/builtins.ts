import { BuiltinName } from '../../builtins';
import { BOOL_TYPE, NUMBER_TYPE, STRING_TYPE } from '../types/common';
import { arrayType, functionType, TupleParams, tupleType, typeVar } from '../types/builders';
import { Scheme } from '../types/scheme';
import { functionScheme } from './helpers';
import { range } from '../../util';

export const builtins: Record<BuiltinName, Scheme> = {
    [BuiltinName.Add]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.Subtract]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.Multiply]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.Divide]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.Modulus]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.LessThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.LessEqualThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.GreaterThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.GreaterEqualThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    // todo solve this with type classes (they could be boolean, could be strings)
    [BuiltinName.Equal]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.NotEqual]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.And]: functionScheme(BOOL_TYPE, BOOL_TYPE, BOOL_TYPE),
    [BuiltinName.Or]: functionScheme(BOOL_TYPE, BOOL_TYPE, BOOL_TYPE),
    [BuiltinName.Not]: functionScheme(BOOL_TYPE, BOOL_TYPE),
    [BuiltinName.Tuple2]: tupleConstructorScheme(2),
    [BuiltinName.Tuple3]: tupleConstructorScheme(3),
    [BuiltinName.Tuple4]: tupleConstructorScheme(4),
    [BuiltinName.Tuple5]: tupleConstructorScheme(5),
    [BuiltinName.Compose]: functionScheme(
        functionType(typeVar('u2'), typeVar('u3')),
        functionType(typeVar('u1'), typeVar('u2')),
        functionType(typeVar('u1'), typeVar('u3')),
    ),
    [BuiltinName.Pipe]: functionScheme(
        typeVar('u1'),
        functionType(typeVar('u1'), typeVar('u2')),
        typeVar('u2'),
    ),
    [BuiltinName.Identity]: functionScheme(typeVar('u1'), typeVar('u1')),
    [BuiltinName.Constant]: functionScheme(typeVar('u1'), typeVar('u2'), typeVar('u1')),
    [BuiltinName.ToString]: functionScheme(typeVar('u1'), STRING_TYPE),
    [BuiltinName.SquareRoot]: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.First]: functionScheme(
        tupleType(typeVar('u1'), typeVar('u2')),
        typeVar('u1'),
    ),
    [BuiltinName.Second]: functionScheme(
        tupleType(typeVar('u1'), typeVar('u2')),
        typeVar('u2'),
    ),
    [BuiltinName.ExtendArray]: functionScheme(
        arrayType(typeVar('u1')),
        typeVar('u1'),
        arrayType(typeVar('u1')),
    ),
    [BuiltinName.Head]: functionScheme(
        arrayType(typeVar('u1')),
        typeVar('u1'),
    ),
    [BuiltinName.Tail]: functionScheme(
        arrayType(typeVar('u1')),
        arrayType(typeVar('u1')),
    ),
    [BuiltinName.IsEmpty]: functionScheme(
        arrayType(typeVar('u1')),
        BOOL_TYPE,
    ),
    [BuiltinName.Concat]: functionScheme(
        arrayType(typeVar('u1')),
        arrayType(typeVar('u1')),
        arrayType(typeVar('u1')),
    ),
    [BuiltinName.Map]: functionScheme(
        functionType(typeVar('u1'), typeVar('u2')),
        arrayType(typeVar('u1')),
        arrayType(typeVar('u2')),
    ),
    [BuiltinName.Filter]: functionScheme(
        functionType(typeVar('u1'), BOOL_TYPE),
        arrayType(typeVar('u1')),
        arrayType(typeVar('u1')),
    ),
    [BuiltinName.Reduce]: functionScheme(
        functionType(typeVar('u2'), typeVar('u1'), typeVar('u2')),
        typeVar('u2'),
        arrayType(typeVar('u1')),
        typeVar('u2'),
    ),
    [BuiltinName.Reduce0]: functionScheme(
        functionType(typeVar('u1'), typeVar('u1'), typeVar('u1')),
        arrayType(typeVar('u1')),
        typeVar('u1'),
    ),
    [BuiltinName.Join]: functionScheme(
        STRING_TYPE,
        arrayType(typeVar('u1')),
        STRING_TYPE,
    ),
    [BuiltinName.Length]: functionScheme(
        arrayType(typeVar('u1')),
        NUMBER_TYPE,
    ),

};

function tupleConstructorScheme(size: TupleParams['length']) {
    const paramTypes = [
        typeVar('u1'),
        typeVar('u2'),
        ...range(2, size).map(n => typeVar(`u${n + 1}`)),
    ] as TupleParams;
    const resultType = tupleType(...paramTypes);

    const [t1, t2, ...tRest] = paramTypes;
    // the type system cannot infer functionScheme(...paramTypes, resultType)
    return functionScheme(t1, t2, ...tRest, resultType);
}
