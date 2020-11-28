{
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
    Additive

/*
<Additive> :=
    | <Term> "+" <Additive>
    | <Term> "-" <Additive>
    | <Term>
*/
Additive =
    left:Multiplicative operator:("+" / "-") right:Additive {
        return makeCall(operator, [left, right]);
    }
    / Multiplicative


/*
<Multiplicative> :=
    | <Factor> * <Multiplicative>
    | <Factor> / <Multiplicative>
    | <Factor>
*/
Multiplicative =
    left:Factor operator:("*" / "/") right:Multiplicative {
        return makeCall(operator, [left, right]);
    }
    / Factor

/*
<Factor> =
    | <Number>
    | <Primary>
*/
Factor =
    Number
    / Primary

Primary =
    "(" additive:Additive ")" {
        return additive;
    }

Number =
    digits:[0-9]+ {
        const value = parseInt(digits.join(""), 10);
        return makeNumber(value);
    }

