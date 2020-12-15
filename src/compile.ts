import { parseModule } from './parser';
import { check } from './checker';
import { failure, isFailure, Result, success } from './util';
import { Context } from './checker/types/context';

interface CompilerOutput {
    types: Context;
    code: string;
}

export function compile(source: string): Result<CompilerOutput, string> {
    const ast = parseModule(source);

    const checkerResult = check(ast);
    if (isFailure(checkerResult)) {
        return failure(checkerResult.error);
    }

    return success({
        types: checkerResult.value,
        code: 'not yet',
    });
}

compile('marko');
