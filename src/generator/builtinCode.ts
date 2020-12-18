import { BuiltinName } from '../builtins';

export const builtinCode = `
function ${BuiltinName.ToString}(x) {
    return x.toString();
}

function ${BuiltinName.Identity}(x) {
    return x;
}

function ${BuiltinName.Constant}(x) {
    return function(y) {
        return x;
    };
}

function sqrt(n) {
    return Math.sqrt(n);
}`.substring(1);
