import { Module } from '../ast';
import { failure, Result, success } from '../util';
import { translateModule } from './translation/module';
import { builtinCode } from './builtinCode';

export function generateJs(ast: Module): Result<string, string> {
    try {
        const translatedCode = translateModule(ast);
        const code = [builtinCode, translatedCode].join('\n\n');
        return success(code);
    } catch (e) {
        return failure(e.message);
    }
}

