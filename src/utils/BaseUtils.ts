function identity(x) {
    return x;
}

function isZero(x) {
    return Math.abs(x) < 10 * Number.EPSILON;
}

// returns a unit vector in the direction of vec, if vec is nonzero
// if vec is zero, returns 0
function unitVector(vec, round = identity) {
    const length = vectorLength(vec);

    if (isZero(length)) {
        return 0;
    }

    let new_arr = [];

    for (let i = 0; i < vec.length; i++) {
        new_arr[i] = round(vec[i] / length);
    }

    return new_arr;
}

function vectorLength(vec) {
    let sum = 0;

    for (let i = 0; i < vec.length; i++) {
        sum += vec[i] ** 2;
    }

    return Math.sqrt(sum);
}

function vectorAdd(v, w) {
    const newVector = [];
    const m = Math.max(v.length, w.length);

    for (let i = 0; i < m; i++) {
        if (!v[i]) {
            v[i] = 0;
        }
        if (!w[i]) {
            w[i] = 0;
        }
        newVector.push(v[i] + w[i]);
    }

    return newVector;
}

function scalarMultiply(vec, s) {
    let newVec = [];
    for (let i = 0; i < vec.length; i++) {
        newVec[i] = vec[i] * s;
    }
    return newVec;
}

function round(x, n = 2) {
    // x = -2.336596841557143

    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}

// from the book 'Discover Functional Javascript', p. 58
function throttle(fn, interval) {
    let lastTime;

    return function throttled(...args) {
        if (!lastTime || Date.now() - lastTime >= interval) {
            fn(...args);
            lastTime = Date.now();
        }
    };
}

function processNum(num, precision = 5, epsilon = 10 ** -precision) {
    if (Math.abs(num) < epsilon) return { str: '0', texStr: '0' };

    let x = num.toPrecision(precision);

    let arr = x.split('e');

    if (arr.length === 1) {
        return { str: x, texStr: x };
    }

    // otherwise it is in scientific notation
    //
    // e.g., 1.458e-21 or 1.458e+21
    //

    if (arr[1][0] === '-') {
        return {
            str: arr[0] + '*10^(' + arr[1] + ')',
            texStr: '(' + arr[0] + '\\cdot 10^{' + arr[1] + '}' + ')'
        };
    }

    // get rid of the '+' before returning
    return {
        str: arr[0] + '*10^(' + arr[1].split('+')[1] + ')',
        texStr: '(' + arr[0] + '\\cdot 10^{' + arr[1].split('+')[1] + '}' + ')'
    };
}

// input: positive integer arguments a, b
// output: {gdc, aCoeff, bCoeff} with gdc = a*aCoeff + b*Coeff

const eGCD = (a, b) => {
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
        console.log('eGCD was called with a non-integer argument; returned null');
        return;
    }

    if (a < 0 || b < 0) {
        console.log('eGCD was called with a non-positive integer argument; returned null');
        return;
    }

    let newA = a,
        newB = b,
        swapped = false;

    if (a < b) {
        swapped = true;
        newA = b;
        newB = a;
    }

    const r = newA % newB;
    const q = (newA - r) / newB;

    // should have newA = q*newB + r, with 0 <= r < newB

    // if r = 0, then done
    if (r === 0) {
        if (swapped) return { gcd: newB, aCoeff: -q + 1, bCoeff: 1 };

        return { gcd: newB, aCoeff: 1, bCoeff: -q + 1 };
    }

    const { gcd, aCoeff, bCoeff } = eGCD(newB, r);

    if (swapped) return { gcd, aCoeff: aCoeff - q * bCoeff, bCoeff };

    return { gcd, aCoeff: bCoeff, bCoeff: aCoeff - q * bCoeff };
};

const a = 121209;
const b = 1070107;

const e = eGCD(a, b);

const test = e.gcd === a * e.aCoeff + b * e.bCoeff;

const radToDeg = (rad) => rad * 57.2958;

const degToRad = (deg) => deg * 0.0174533;

//------------------------------------------------------------------------

export function diffObjects(ob1, ob2) {
    let result = {};
    let keys1 = Object.keys(ob1);
    let keys2 = Object.keys(ob2);

    keys1.forEach((k) => {
        if (keys2.includes(k)) {
            if (!(ob1[k] === ob2[k])) result[k] = ob1[k];
        }
    });

    return result;
}

// called on

// const ob1 = {
//     '48': '{"sid":"48","name":"title 1"}',
//     '77': '{"sid":"77","name":"The blahblah title"}',
//     '83': '{"sid":"83","name":"The blahblah derp"}',
//     '87': '{"sid":"87","name":"The derpy title 4"}'
// };

// const obj2 = {
//     '48': '{"sid":"48","name":"title 1"}',
//     '77': '{"sid":"77","name":"The blahblah title"}'
// };

// // should return
// const ob = {
//     '83': '{"sid":"83","name":"The blahblah derp"}',
//     '87': '{"sid":"87","name":"The derpy title 4"}'
// };

export const isEmpty = (obj) => obj && Object.keys(obj).length === 0 && obj.constructor === Object;

export function pubsub() {
    const subscribers = [];
    return {
        subscribe: function (subscriber) {
            subscribers.push(subscriber);
        },
        publish: function (pubObj) {
            subscribers.forEach(function (subscriber) {
                subscriber(pubObj);
            });
        }
    };
}

export {
    isZero,
    scalarMultiply,
    unitVector,
    vectorAdd,
    vectorLength,
    round,
    throttle,
    processNum,
    eGCD
};
