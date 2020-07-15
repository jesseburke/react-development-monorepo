import {Parser} from 'expr-eval';

export default function funcParser(funcStr) {

    const parser = new Parser();

    parser.consts.e = Math.E;
    
    return ((x0,y0) => parser.evaluate(funcStr, {x:x0, y:y0}));

}

export function funcParserXT(funcStr) {

    const parser = new Parser();

    parser.consts.e = Math.E;
    
    return ((x0,t0) => parser.evaluate(funcStr, {x:x0, t:t0}));

}
