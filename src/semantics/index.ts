import { Module } from '../ast';
import { inferModule } from './inference/module';
import { failure, Result, success } from '../util';
import { Context } from './types/context';

export function check(ast: Module): Result<Context, string> {
    try {
        const context = inferModule(ast);
        return success(context);
    } catch (e) {
        return failure(e.message);
    }
}
