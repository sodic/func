import { BuiltinName } from '../builtins';
import { BuiltinsTranspiledAsFunctions, mapBuiltinName } from './transpile/builtins';
import { indent } from './transpile/helpers';

const builtinFunctionDefinitions: Record<BuiltinsTranspiledAsFunctions, string> = {
    [BuiltinName.ToString]: `function (x) {
${indent(1)}return x.toString();
}`,
    [BuiltinName.Identity]: `function (x) {
${indent(1)}return x;
}`,
    [BuiltinName.Constant]: `function (x) {
${indent(1)}return function (y) {
${indent(2)}return x;
${indent(1)}};
}`,
    [BuiltinName.SquareRoot]: `function (n) {
${indent(1)}return Math.sqrt(n);
}`,
    [BuiltinName.Tuple2]: `function (x) {
${indent(1)}return function (y) {
${indent(2)}return [x, y];
${indent(1)}};
}`,
    [BuiltinName.Tuple3]: `function (x) {
${indent(1)}return function (y) {
${indent(2)}return function (z) {
${indent(3)}return [x, y, z];
${indent(2)}};
${indent(1)}};
}`,
    [BuiltinName.Tuple4]: `function (x) {
${indent(1)}return function (y) {
${indent(2)}return function (z) {
${indent(3)}return function (v) {
${indent(4)}return [x, y, z, v];
${indent(3)}};
${indent(2)}};
${indent(1)}};
}`,
    [BuiltinName.Tuple4]: `function (x) {
${indent(1)}return function (y) {
${indent(2)}return function (z) {
${indent(3)}return function (v) {
${indent(4)}return function (u) {
${indent(5)}return [x, y, z, v, u];
${indent(4)}};
${indent(3)}};
${indent(2)}};
${indent(1)}}
}`,
    [BuiltinName.Tuple5]: `function (x) {
${indent(1)}return function (y) {
${indent(2)}return function (z) {
${indent(3)}return function (v) {
${indent(4)}return function (u) {
${indent(5)}return function (w) {
${indent(6)}return [x, y, z, v, u, w];
${indent(5)}};
${indent(4)}};
${indent(3)}};
${indent(2)}};
${indent(1)}}
}`,
    [BuiltinName.Compose]: `function (f) {
${indent(1)}return function (g) {
${indent(2)}return function (x) {
${indent(3)}return f(g(x));
${indent(2)}}
${indent(1)}}
}`,
    [BuiltinName.Pipe]: `function (x) {
${indent(1)}return function (f) {
${indent(2)}return f(x); 
${indent(1)}}
}`,
    [BuiltinName.First]: `function (tuple) {
${indent(1)}return tuple[0];
}`,
    [BuiltinName.Second]: `function (tuple) {
${indent(1)}return tuple[1];
}`,
    [BuiltinName.ExtendArray]: `function (array) {
${indent(1)}return function (element) {
${indent(2)}return [...array, element];
${indent(1)}}
}`,
    [BuiltinName.Head]: `function (array) {
${indent(1)}const h = array[0];
${indent(1)}if (h === undefined) {
${indent(2)}throw new Error('Head called on empty array');
${indent(1)}}
${indent(1)}return h;
}`,
    [BuiltinName.Tail]: `function (array) {
${indent(1)}return array.slice(1);
}`,
    [BuiltinName.IsEmpty]: `function (array) {
${indent(1)}return array.length == 0;
}`,
    [BuiltinName.Concat]: `function (a1) {
${indent(1)}return function (a2) {
${indent(2)}return a1.concat(a2);
${indent(1)}}
}`,
    [BuiltinName.Map]: `function (f) {
${indent(1)}return function (array) {
${indent(2)}return array.map(f);
${indent(1)}};
}`,
    [BuiltinName.Filter]: `function (f) {
${indent(1)}return function (array) {
${indent(2)}return array.filter(f);
${indent(1)}};
}`,
    [BuiltinName.Reduce]: `function (f) {
${indent(1)}return function (start) {
${indent(2)}return function (array) {
${indent(3)}return array.reduce((acc, curr) => f(acc)(curr), start);
${indent(2)}};
${indent(1)}};
}`,
    [BuiltinName.Reduce0]: `function (f) {
${indent(1)}return function (array) {
${indent(2)}return array.reduce((acc, curr) => f(acc)(curr));
${indent(1)}};
}`,
    [BuiltinName.Join]: `function (separator) {
${indent(1)}return function (array) {
${indent(2)}return array.join(separator);
${indent(1)}};
}`,
    [BuiltinName.Length]: `function (array) {
${indent(1)}return array.length;
}`,
};

export const builtinDefinitions = Object.entries(builtinFunctionDefinitions)
    .map(([name, body]) => `const ${mapBuiltinName(name as BuiltinName)} = ${body};`)
    .join('\n\n');
