import fs from 'fs';
import { generate as generateParser } from 'pegjs';

function makeParser(startRule: string, trace = false) {
    const grammar = fs.readFileSync('resources/grammar/grammar.pegjs').toString();
    const parser = generateParser(grammar, {
        output: 'source',
        format: 'bare',
        allowedStartRules: [startRule],
        trace,
    });
    const parserName = `${startRule.toLowerCase()}Parser`;
    return `export const ${parserName} = ${parser}`;
}

function makeParsers() {
    const parsersSource = ['Module', 'Statement', 'Expression']
        .map(startRule => makeParser(startRule))
        // prevents "declaration emit for this file requires using private name" error
        .map(parserSource => ['/** @type {any} */', parserSource].join('\n'))
        .join('\n');
    fs.writeFileSync('src/parser/pegjsParsers.js', parsersSource);
}

makeParsers();

