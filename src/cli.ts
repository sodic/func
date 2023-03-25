import Path from 'path';
import fs from 'fs';
import { isFailure } from './util';
import { compile } from '.';

(function main() {
    const filePath = process.argv[process.argv.length - 1];
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const sourceCode = fs.readFileSync(filePath, 'utf-8');

    const compileResult = compile(sourceCode);
    if (isFailure(compileResult)) {
        console.error(compileResult.error);
        process.exit(1);
    }

    const fileName = Path.parse(filePath).name;
    fs.writeFileSync(`${fileName}.js`, compileResult.value);
    console.log(`Compiled successfully, output written to ${fileName}.js.`);
})();
