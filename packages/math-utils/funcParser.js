import { Parser } from 'expr-eval';

export function funcParser(funcStr, firstVar = 'x', secondVar = 'y') {
    const parser = new Parser();

    parser.consts.e = Math.E;

    return (x0, y0) => {
        const newObj = {};
        newObj[firstVar] = x0;
        newObj[secondVar] = y0;
        return parser.evaluate(funcStr, newObj);
    };
}
