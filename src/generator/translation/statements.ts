import { Statement } from '../../ast';
import { translateExpression } from './expressions';
import { validJsName } from '../names';

export function translateStatement(s: Statement): string {
    const { name, expression } = s;
    const bodyCode = translateExpression(expression);
    return `const ${validJsName(name)} = ${bodyCode}`;
}
