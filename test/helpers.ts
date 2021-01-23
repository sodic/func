import { validJsName } from '../src/codeGeneration/transpile/names';

export function evaluateAndRead(source: string, variable: string): unknown {
    return (new Function(`${source}\nreturn ${validJsName(variable)};`))();
}
