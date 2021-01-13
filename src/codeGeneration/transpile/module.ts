import { Module } from '../../ast';
import { transpileStatement } from './statements';

export function transpileModule(module: Module): string {
    return module.statements
        .map(transpileStatement)
        .join('\n\n');
}
