import fs from 'fs';
import { generate as generateParser } from 'pegjs';

function makeParser(startRule: string) {
    const grammar = fs.readFileSync('resources/grammar/grammar.pegjs').toString();
    const parser = generateParser(grammar, {
        output: 'source',
        format: 'bare',
        allowedStartRules: [startRule],
        trace: true,
    });
    const parserName = `${startRule.toLowerCase()}Parser`;
    return `export const ${parserName} = ${parser}`;
}

function makeParsers() {
    const parsersSource = ['Module', 'Statement', 'Expression']
        .map(makeParser)
        .join('\n');
    fs.writeFileSync('src/parser/pegjsParsers.js', parsersSource);
}

makeParsers();

