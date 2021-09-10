import { round } from '@jesseburke/basic-utils.js';

// global variables for this module
let w, h;
let ptArray = [],
    sqArray = [];
let xMin, xMax, yMin, yMax;

//
// func is a function of two variables

export default function ImplicitFuncGraph({ func, bounds, approxH, c = 0 }) {
    xMin = bounds.xMin;
    xMax = bounds.xMax;
    yMin = bounds.yMin;
    yMax = bounds.yMax;

    w = Math.floor((xMax - xMin) / approxH);
    h = Math.floor((yMax - yMin) / approxH);

    ptArray = [];
    sqArray = [];

    // initialize ptArray
    for (let j = 0; j <= Math.floor((yMax - yMin) / approxH); j++) {
        for (let i = 0; i <= Math.floor((xMax - xMin) / approxH); i++) {
            ptArray.push(round(func(i * approxH + xMin, yMax - j * approxH) - c, 3));
        }
    }

    // initial sqArray

    let n, sqValue;

    for (let a = 0; a < h; a++) {
        for (let b = 0; b < w; b++) {
            n = a * w + b;
            sqValue = 0;

            // square vertices are valued 1, 2, 3, 4, starting in upper left and going cc.
            // assign a value to the square based on whether ptArray is positive or negative
            // at its four vertices
            //
            // this value will give the square type

            const [ul, ll, lr, ur] = vertsOfSq(n, w);
            // upper left
            sqValue += ptArray[ul] >= 0 ? 1 : 0;
            // lower left
            sqValue += ptArray[ll] >= 0 ? 2 : 0;
            // lower right
            sqValue += ptArray[lr] >= 0 ? 4 : 0;
            // upper right
            sqValue += ptArray[ur] >= 0 ? 8 : 0;

            sqArray[n] = sqValue;
        }
    }

    let visitedArray = sqArray.slice();
    let curComp,
        side,
        compArray = [];

    for (let i = 0; i < sqArray.length; i++) {
        // check whether have already visited (=-1), or
        // square has no line through it (=0 or 15)
        //
        if (visitedArray[i] <= 0 || visitedArray[i] === 15) continue;

        curComp = constructComp(i);
        compArray.push(curComp.newPtArray);
        curComp.visitedArray.forEach((i) => (visitedArray[i] = -1));
    }

    return compArray;
}

function coordsOfPt(ptIndex) {
    // write sqIndex as a*w + b:
    const a = Math.floor(ptIndex / (w + 1));
    const b = ptIndex - a * (w + 1);

    return [(b / w) * (xMax - xMin) + xMin, yMax - (a / h) * (yMax - yMin)];
}

function vertsOfSq(sqIndex) {
    // write sqIndex as a*w + b:
    const a = Math.floor(sqIndex / w);
    const b = sqIndex - a * w;

    // tl, bl, br, tr
    return [
        a * (w + 1) + b,
        (a + 1) * (w + 1) + b,
        (a + 1) * (w + 1) + (b + 1),
        a * (w + 1) + (b + 1)
    ];
}

// right now, if go out of bounds, end component; but really, should go back to inital
// square, and start tracing in the other direction
function constructComp(initialSq) {
    const initialSide = oneSide(sqArray[initialSq]);

    // initialSq does not have a path through it
    if (initialSide === -1) return null;

    let curSq = initialSq;
    let sideA = initialSide;

    let newPtArray = [ptOnSide(curSq, sideA)],
        visitedArray = [curSq];

    let sideB = nextSide(sqArray[curSq], sideA);
    newPtArray.push(ptOnSide(curSq, sideB));

    // this is off; e.g., if sideB = 'r', this does not pass the test >= 0
    while (!(sideB === -1)) {
        curSq = borderingSquare(curSq, sideB);

        // bordering square went out of bounds
        if (curSq < 0 || curSq > sqArray.length) {
            break;
        }

        sideA = swap(sideB);
        sideB = nextSide(sqArray[curSq], sideA);

        // check whether arrived back where we started
        if (curSq === initialSq && sideA === initialSide) break;

        //newPtArray.push( ptOnSide(curSq, sideA) );
        newPtArray.push(ptOnSide(curSq, sideB));
        visitedArray.push(curSq);

        // set curSq to be
        // if curSq is -1; if it is, we're done, so set curSide = -1;
        // else, set curSide to be swap of curSide
    }

    return { newPtArray, visitedArray };
}

// test this by tracing inside function above
export function ptOnSide(sqIndex, side) {
    let x1, x2, f1, f2;

    switch (side) {
        case 'l':
            [x1, x2, ,] = vertsOfSq(sqIndex);
            break;

        case 'r':
            [, , x1, x2] = vertsOfSq(sqIndex);
            break;

        case 't':
            [x1, , , x2] = vertsOfSq(sqIndex);
            break;

        case 'b':
            [, x1, x2] = vertsOfSq(sqIndex);
            break;
    }

    f1 = ptArray[x1];
    f2 = ptArray[x2];

    return lerpPts(coordsOfPt(x1), coordsOfPt(x2), f1, f2);
}

// pt1 = [x1,y1], pt2 = [x2,y2]
// fi is the value at pti to be lerped

function lerpPts(pt1, pt2, f1, f2) {
    const t = f2 / (f2 - f1);

    return [pt1[0] + t * (pt2[0] - pt1[0]), pt1[1] + t * (pt2[1] - pt1[1])];
}

function swap(side) {
    switch (side) {
        case 'l':
            return 'r';

        case 'r':
            return 'l';

        case 't':
            return 'b';

        case 'b':
            return 't';
    }

    return -1;
}

export function borderingSquare(sqIndex, side) {
    switch (side) {
        case 'l':
            if (sqIndex % w > 0) {
                return sqIndex - 1;
            }
            return -1;
            break;

        case 'r':
            if (sqIndex % w < w - 1) {
                return sqIndex + 1;
            }
            return -1;
            break;

        case 't':
            if (sqIndex > w) {
                return sqIndex - w;
            }
            return -1;
            break;

        case 'b':
            if (sqIndex < (h - 1) * w) {
                return sqIndex + w;
            }
            return -1;
            break;
    }

    return -1;
}

// test
//
// console.log( borderingSquare( 2, 'l' ) ); // 1
// console.log( borderingSquare( 2, 'b' ) ); // 6
// console.log( borderingSquare( 2, 'r' ) ); // 3
// console.log( borderingSquare( 2, 't' ) ); // -1

const sideArray = [
    [],
    [['l', 't']],
    [['l', 'b']],
    [['t', 'b']],
    [['b', 'r']],
    [
        ['l', 't'],
        ['b', 'r']
    ],
    [['l', 'r']],
    [['t', 'r']],
    [['t', 'r']],
    [['l', 'r']],
    [
        ['l', 'b'],
        ['t', 'r']
    ],
    [['b', 'r']],
    [['t', 'b']],
    [['l', 'b']],
    [['l', 't']],
    []
];

export function nextSide(sqNum, side) {
    let t = -1;

    sideArray[sqNum].forEach((s) => {
        if (s[0] === side) t = s[1];
        else if (s[1] === side) t = s[0];
    });

    return t;
}

// test:
//
// console.log( nextSide( 0, 'l' ) ) = -1;
// console.log( nextSide( 1, 'l' ) ) = t;
// console.log( nextSide( 2, 'l' ) ) = b;

// returns one side that has a line to it, given a square number
function oneSide(sqNum) {
    if (sqNum % 4 === 1 || sqNum % 4 === 2) return 'l';
    else if (Math.floor(sqNum / 4) === 1 || Math.floor(sqNum / 4) === 2) return 'r';
    else if (sqNum === 12 || sqNum === 3) return 't';

    return -1;
}
