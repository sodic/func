import { parse } from './parser';
import { check } from './checker';
import { Context } from './checker/types/context';
import { generateJs } from './generator';
import { failure, isFailure, isSuccess, Result, success } from './util';

export interface CompilerOutput {
    types: Context;
    code: string;
}

export function compileVerbose(source: string): Result<CompilerOutput, string> {
    const parserResult = parse(source);
    if (isFailure(parserResult)) {
        return failure(`Syntax error: ${parserResult.error}`);
    }

    const ast = parserResult.value;

    const types = check(ast);
    if (isFailure(types)) {
        return failure(`TypeError: ${types.error}`);
    }

    const code = generateJs(ast);
    if (isFailure(code)) {
        return failure(`Unexpected error: ${code.error}`);
    }

    return success({
        ast,
        types: types.value,
        code: code.value,
    });
}

export function compile(source: string): Result<string, string> {
    const result = compileVerbose(source);
    return isSuccess(result) ? success(result.value.code) : failure(result.error);
}
