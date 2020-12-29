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
${indent(1)}return function(y) {
${indent(2)}return x;
${indent(1)}};
}`,
    [BuiltinName.SquareRoot]: `function ${mapBuiltinName(BuiltinName.SquareRoot)}(n) {
${indent(1)}return Math.sqrt(n);
}`,
    [BuiltinName.Tuple]: `function ${mapBuiltinName(BuiltinName.Tuple)}(x) {
${indent(1)}return function(y) {
${indent(2)}return [x, y];
${indent(1)}}
}`,
};

export const builtinDefinitions = Object.values(builtinDefinitionMap).join('\n\n');
