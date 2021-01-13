import { Module } from '../../ast';
import { inferStatement } from './statements';
import { builtins } from './builtins';
import { Context } from '../types/context';

export function inferModule(module: Module): Context {
    return module.statements.reduce(
        inferStatement,
        builtins,
    );
}
