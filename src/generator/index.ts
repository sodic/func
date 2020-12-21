import { Module } from '../ast';
import { failure, Result, success } from '../util';
import { transpileModule } from './transpile/module';
import { builtinDefinitions } from './definitions';

export function generateJs(ast: Module): Result<string, string> {
    try {
        const transpiledCode = transpileModule(ast);
        const code = [builtinDefinitions, transpiledCode].join(builtinSeparator);
        return success(code);
    } catch (e) {
        return failure(e.message);
    }
}

export function separateBuiltins(code: string): string[] {
    return code.split(builtinSeparator);
}

const builtinSeparator = '\n\n// END BUILTINS\n\n';

