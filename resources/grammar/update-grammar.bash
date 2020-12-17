#!/bin/bash

project_root="$1"
grammar_root="${project_root}/resources/grammar"

cat <(echo '{') \
    <(sed '/exports./d' "${project_root}/dist/ast/builders.js" | sed 's/export //') \
    <(echo '}') \
    "${grammar_root}/grammar.pegjs.template" \
    > "${grammar_root}/grammar.pegjs";
