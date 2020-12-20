export function evaluateAndRead(source: string, variable: string): unknown {
    return (new Function(`${source}\nreturn ${variable};`))();
}
