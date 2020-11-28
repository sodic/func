#!/bin/bash

project_root="$1"
grammar_root="${project_root}/resources/grammar"

cat <(echo '{') \
    <(tail -n +4 "${project_root}/dist/parser/ast/helpers.js" | head -n -1 | sed '/exports./d') \
    <(echo '}') \
    "${grammar_root}/grammar.pegjs.template" \
    > "${grammar_root}/grammar.pegjs";
