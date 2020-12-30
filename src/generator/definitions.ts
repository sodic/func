import { BuiltinName } from '../builtins';
import { BuiltinsTranspiledAsFunctions, mapBuiltinName } from './transpile/builtins';
import { indent } from './transpile/helpers';

const builtinDefinitionMap: Record<BuiltinsTranspiledAsFunctions, string> = {
    [BuiltinName.ToString]: `function ${mapBuiltinName(BuiltinName.ToString)}(x) {
${indent(1)}return x.toString();
}`,
    [BuiltinName.Identity]: `function ${mapBuiltinName(BuiltinName.Identity)}(x) {
${indent(1)}return x;
}`,
    [BuiltinName.Constant]: `function ${mapBuiltinName(BuiltinName.Constant)}(x) {
${indent(1)}return function (y) {
${indent(2)}return x;
${indent(1)}};
}`,
    [BuiltinName.SquareRoot]: `function ${mapBuiltinName(BuiltinName.SquareRoot)}(n) {
${indent(1)}return Math.sqrt(n);
}`,
    [BuiltinName.Tuple2]: `function ${mapBuiltinName(BuiltinName.Tuple2)}(x) {
${indent(1)}return function (y) {
${indent(2)}return [x, y];
${indent(1)}}
}`,
    [BuiltinName.Tuple3]: `function ${mapBuiltinName(BuiltinName.Tuple3)}(x) {
${indent(1)}return function (y) {
${indent(2)}return function (z) {
${indent(3)}return [x, y, z];
${indent(2)}};
${indent(1)}}
}`,
    [BuiltinName.Tuple4]: `function ${mapBuiltinName(BuiltinName.Tuple4)}(x) {
${indent(1)}return function (y) {
${indent(2)}return function (z) {
${indent(3)}return function (v) {
${indent(4)}return [x, y, z, v];
${indent(3)}};
${indent(2)}};
${indent(1)}}
}`,
    [BuiltinName.Tuple4]: `function ${mapBuiltinName(BuiltinName.Tuple4)}(x) {
${indent(1)}return function (y) {
${indent(2)}return function (z) {
${indent(3)}return function (v) {
${indent(4)}return function (u) {
${indent(5)}return [x, y, z, v, u];
${indent(4)}};
${indent(3)}};
${indent(2)}};
${indent(1)}}
}`,
    [BuiltinName.Tuple5]: `function ${mapBuiltinName(BuiltinName.Tuple5)}(x) {
${indent(1)}return function (y) {
${indent(2)}return function (z) {
${indent(3)}return function (v) {
${indent(4)}return function (u) {
${indent(5)}return function (w) {
${indent(6)}return [x, y, z, v, u, w];
${indent(5)}};
${indent(4)}};
${indent(3)}};
${indent(2)}};
${indent(1)}}
}`,
    [BuiltinName.First]: `function ${mapBuiltinName(BuiltinName.First)}(tuple) {
${indent(1)}return tuple[0];
}`,
    [BuiltinName.Second]: `function ${mapBuiltinName(BuiltinName.Second)}(tuple) {
${indent(1)}return tuple[1];
}`,
};

export const builtinDefinitions = Object.values(builtinDefinitionMap).join('\n\n');
