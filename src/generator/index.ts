import { Module } from '../ast';
import { failure, Result, success } from '../util';
import { transpileModule } from './transpile/module';
import { builtinCode } from './builtinCode';


const builtinSeparator = '\n\n// END BUILTINS\n\n';

export function generateJs(ast: Module): Result<string, string> {
    try {
        const transpiledCode = transpileModule(ast);
        const code = [builtinCode, transpiledCode].join(builtinSeparator);
        return success(code);
    } catch (e) {
        return failure(e.message);
    }
}

export function separateBuiltins(code: string): string[] {
    return code.split(builtinSeparator);
}
