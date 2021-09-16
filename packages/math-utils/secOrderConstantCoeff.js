import { processNum } from '@jesseburke/basic-utils';
import { MatrixFactory } from './MatrixFactory';

// a,b are numbers, initialConds is a 2 elt array of 2 elt arrays
//
// returns an object of the form {str, texStr}

export function solnStrs(a, b, initialConds, precision = 3) {
    const [[x0, y0], [x1, y1]] = initialConds;

    let returnVal;

    if (a * a - 4 * b > 0) {
        // in this case solns have form y = Ce^{m1 * x} + De^{m2 * x}

        const sr = Math.sqrt(a * a - 4 * b);

        let m1 = (-a + sr) / 2;
        let m2 = (-a - sr) / 2;

        const A = [
            [Math.E ** (m1 * x0), Math.E ** (m2 * x0), y0],
            [m1 * Math.E ** (m1 * x1), m2 * Math.E ** (m2 * x1), y1]
        ];

        // putting A in rref will allow us to find C,D

        const m = MatrixFactory(A).rref().getArray();
        let C = processNum(m[0][2], precision);
        let D = processNum(m[1][2], precision);

        // prepare numbers for display
        m1 = processNum(m1, precision);
        m2 = processNum(m2, precision);

        returnVal = {
            str: `${C.str}*e^(${m1.str}*x) + ${D.str}*e^(${m2.str}*x)`,
            texStr: `y = ${C.texStr}\\cdot e^{${m1.texStr}\\cdot x} + ${D.texStr}\\cdot
 e^{${m2.texStr}\\cdot x}`
        };

        return returnVal;
    } else if (a * a - 4 * b < 0) {
        let k = Math.sqrt(4 * b - a * a) / 2;

        // in this case solns have form y = e^{-ax/2}(A cos(kx + w)

        const alpha = Math.E ** ((-a * x0) / 2) * Math.cos(k * x0);
        const beta = Math.E ** ((-a * x0) / 2) * Math.sin(k * x0);
        const gamma =
            Math.E ** ((-a * x1) / 2) * ((-a / 2) * Math.cos(k * x1) - k * Math.sin(k * x1));
        const delta =
            Math.E ** ((-a * x1) / 2) * ((-a / 2) * Math.sin(k * x1) + k * Math.cos(k * x1));

        // should now have alpha*C + beta*D = y0, gamma*C + delta*D = y1,
        const tA = [
            [alpha, beta, y0],
            [gamma, delta, y1]
        ];
        let m = MatrixFactory(tA);

        m = m.rref().getArray();

        let C = processNum(m[0][2], precision);
        let D = processNum(m[1][2], precision);
        k = processNum(k, precision);

        // to put equation in form of notes
        const phi = processNum(
            Math.atan(-Number.parseFloat(D.str) / Number.parseFloat(C.str)),
            precision
        );

        const newA = processNum(
            Number.parseFloat(C.str) / Math.cos(Number.parseFloat(phi.str)),
            precision
        );

        if (a === 0) {
            returnVal = {
                str: ` (${C.str})*cos((${k.str})*x) + (${D.str})*sin((${k.str})*x)`,
                texStr: `y = ${newA.texStr} \\cdot \\cos(${k.texStr}\\cdot x +` + ` ${phi.texStr})`
            };

            return returnVal;
        }

        returnVal = {
            str: `e^(-(${a / 2})*x)*( (${C.str})*cos((${k.str})*x) + (${D.str})*sin((${
                k.str
            })*x) )`,
            texStr:
                `y = e^{${-a / 2}\\cdot x}\\left(` +
                `${newA.texStr} \\cdot \\cos(${k.texStr}\\cdot x +` +
                ` ${phi.texStr})\\right)`
        }; // ${C.texStr}\\cdot\\cos(${k.texStr}x)+${D.texStr}\\cdot\\sin(${k.texStr}x) )`};

        return returnVal;

        // in this case solns have form y = e^{-ax/2}(C cos(kx) + D sin(kx)), where k = (4*b-a^2)^(1/2)/4

        // let k =  Math.sqrt( 4*b - a*a )/2;

        // const alpha = Math.E**(-a*x0/2) * Math.cos(k*x0);
        // const beta = Math.E**(-a*x0/2) * Math.sin(k*x0);
        // const gamma = Math.E**(-a*x1/2) * ( -a/2*Math.cos(k*x1) - k*Math.sin(k*x1) );
        // const delta = Math.E**(-a*x1/2) * ( -a/2*Math.sin(k*x1) - k*Math.cos(k*x1) );

        // // should now have alpha*C + beta*D = y0, gamma*C + delta*D = y1,
        // const tA = [[ alpha, beta, y0], [gamma, delta, y1]];
        // let m = MatrixFactory( tA );

        // m = m.rref().getArray();

        // let C = processNum(m[0][2], precision);
        // let D = processNum(m[1][2], precision);
        // k = processNum(k, precision);

        // // to put equation in form of notes
        // const phi = processNum( Math.atan( -Number.parseFloat(D.str)/Number.parseFloat(C.str) ), precision );

        // const newA = processNum( Number.parseFloat(C.str)/Math.cos(Number.parseFloat(phi.str)),
        //                          precision );

        // if( a === 0 ) {

        //     returnVal =  {str: ` (${C.str})*cos((${k.str})*x) + (${D.str})*sin((${k.str})*x)`,
        //                   texStr: `y = ${newA.texStr} \\cdot \\cos(${k.texStr}\\cdot x +`
        // 		  + ` ${phi.texStr})`};

        //     return returnVal;
        // }

        //  returnVal =  {str: `e^(-(${a/2})*x)*( (${C.str})*cos((${k.str})*x) + (${D.str})*sin((${k.str})*x) )`,
        //                texStr: `y = e^{${-a/2}\\cdot x}\\left(`
        //  	      + `${newA.texStr} \\cdot \\cos(${k.texStr}\\cdot x +`
        // 	       + ` ${phi.texStr})\\right)`};// ${C.texStr}\\cdot\\cos(${k.texStr}x)+${D.texStr}\\cdot\\sin(${k.texStr}x) )`};

        //  return returnVal;
    } else if (a * a - 4 * b === 0) {
        // in this case solns have the form y = Cxe^{-ax/2} + De^{-ax/2}

        const alpha = Math.E ** ((-a * x0) / 2) * x0;
        const beta = Math.E ** ((-a * x0) / 2);
        const gamma = Math.E ** ((-a * x1) / 2) * (-a / 2) * x0 + Math.E ** ((-a * x1) / 2);
        const delta = Math.E ** ((-a * x1) / 2) * (-a / 2);

        // should now have alpha*C + beta*D = y0, gamma*C + delta*D = y1,
        const A = [
            [alpha, beta, y0],
            [gamma, delta, y1]
        ];
        const m = MatrixFactory(A).rref().getArray();
        let C = processNum(m[0][2], precision);
        let D = processNum(m[1][2], precision);

        // if a is zero
        if (Math.abs(a) <= 10 ** -precision) {
            returnVal = {
                str: `(${C.str})*x*e^(-(${a})*x/2) + (${D.str})*e^(-(${a})*x/2)`,
                texStr:
                    `y = ${C.texStr}\\cdot x` +
                    ` e^{${-a / 2}\\cdot x} + ${D.texStr}\\cdot` +
                    ` e^{${-a / 2}\\cdot x}`
            };

            return returnVal;
        }

        returnVal = {
            str: `(${C.str})* x * e^(-(${a})* x/2) + (${D.str})* e^(-(${a})* x/2)`,
            texStr:
                `y = ${C.texStr}\\cdot x e^{${-a / 2}\\cdot x} +` +
                ` ${D.texStr}\\cdot e^{${-a / 2}\\cdot x}`
        };

        return returnVal;
    }
}
