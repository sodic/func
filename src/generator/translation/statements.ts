import { Statement } from '../../ast';
import { translateExpression } from './expressions';
import { validJsName } from '../names';

export function translateStatement(statement: Statement): string {
    const { name, expression } = statement;
    const bodyCode = translateExpression(expression);
    return `const ${validJsName(name)} = ${bodyCode};`;
}
