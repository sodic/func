import { Module } from '../../ast';
import { translateStatement } from './statements';

export function translateModule(module: Module): string {
    return module.statements
        .map(translateStatement)
        .join('\n');
}
