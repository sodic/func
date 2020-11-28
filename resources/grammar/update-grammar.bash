#!/bin/bash
cat <(echo '{') \
    <(tail -n +4 ../../dist/parser/ast/helpers.js | head -n -1 | sed '/exports./d') \
    <(echo '}') \
    grammar.pegjs.template \
    > grammar.pegjs;
