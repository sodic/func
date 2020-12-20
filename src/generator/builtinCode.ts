import { BuiltinName } from '../builtins';
import { indent } from './transpile/helpers';
import { mapBuiltinName } from './transpile/names';

export const builtinCode = `
function ${mapBuiltinName(BuiltinName.ToString)}(x) {
${indent(1)}return x.toString();
}

function ${mapBuiltinName(BuiltinName.Identity)}(x) {
${indent(1)}return x;
}

function ${mapBuiltinName(BuiltinName.Constant)}(x) {
${indent(1)}return function(y) {
${indent(2)}return x;
${indent(1)}};
}

function ${mapBuiltinName(BuiltinName.SquareRoot)}(n) {
${indent(1)}return Math.sqrt(n);
}`.substring(1);
