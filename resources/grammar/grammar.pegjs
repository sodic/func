{
function buildBinaryExpressionChain(head, tail) {
    return tail.reduce((acc, element) => ({
        kind: 'call',
        functionName: element[1],
        arguments: [acc, element[3]],
    }), head);
}
function makeCall(functionName, args) {
    return {
        kind: 'call',
        functionName,
        arguments: args,
    };
}
function makeNumber(value) {
    return {
        kind: 'literal',
        value: {
            kind: 'number',
            value,
        },
    };
}
}
Expression =
    AdditiveExpression

/*
<AdditiveExpression> :=
    | <Term> (<AdditiveOperator> <Term>)
*/
AdditiveExpression =
    head:Term tail:(_ AdditiveOperator _ Term)* {
        return buildBinaryExpressionChain(head, tail);
    }

AdditiveOperator =
    "+"
    / "-"

Term =
    MultiplicativeExpression

/*
<MultiplicativeExpression> :=
    | <Factor> (<MultiplicativeOperator> <Factor>)*
*/
MultiplicativeExpression =
    head:Factor tail:(_ MultiplicativeOperator _ Factor)* {
        return buildBinaryExpressionChain(head, tail);
    }

/*
<Factor> =
    | <PrimaryExpression>
*/
Factor =
    PrimaryExpression

MultiplicativeOperator =
    "*"
    / "/"
    / "%"

PrimaryExpression =
    ParenthesizedExpression
    / NumberLiteral

ParenthesizedExpression =
    "(" _ expression:Expression _ ")" {
        return expression;
    }

NumberLiteral =
    digits:[0-9]+ {
        const value = parseInt(digits.join(""), 10);
        return makeNumber(value);
    }

_ "Whitespace" = [ \t]*
