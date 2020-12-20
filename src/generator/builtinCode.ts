import { BuiltinName } from '../builtins';
import { indent } from './transpile/helpers';

export const builtinCode = `
function ${BuiltinName.ToString}(x) {
${indent(1)}return x.toString();
}

function ${BuiltinName.Identity}(x) {
${indent(1)}return x;
}

function ${BuiltinName.Constant}(x) {
${indent(1)}return function(y) {
${indent(2)}return x;
${indent(1)}};
}

function ${BuiltinName.SquareRoot}(n) {
${indent(1)}return Math.sqrt(n);
}`.substring(1);
