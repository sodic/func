import { Statement } from '../../ast';
import { transpileExpression } from './expressions';
import { validJsName } from './names';

export function transpileStatement(statement: Statement): string {
    const { name, expression } = statement;
    const bodyCode = transpileExpression(expression);
    return `const ${validJsName(name)} = ${bodyCode};`;
}
