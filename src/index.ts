import { parse } from './parser';
import { check } from './checker';
import { Context } from './checker/types/context';
import { generateJs } from './generator';
import { failure, isFailure, Result, success } from './util';

export interface CompilerOutput {
    types: Context;
    code: string;
}

export function compile(source: string): Result<CompilerOutput, string> {
    const parserResult = parse(source);
    if (isFailure(parserResult)) {
        return failure(`Syntax error: ${parserResult.error}`);
    }

    const ast = parserResult.value;

    const checkerResult = check(ast);
    if (isFailure(checkerResult)) {
        return failure(`TypeError: ${checkerResult.error}`);
    }

    const generatedCode = generateJs(ast);
    if (isFailure(generatedCode)) {
        return failure(`Unexpected error: ${generatedCode.error}`);
    }

    return success({
        types: checkerResult.value,
        code: generatedCode.value,
    });
}

compile('marko');
