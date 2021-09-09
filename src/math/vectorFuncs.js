function identity(x) {
    return x;
}

export function isZero(x) {
    return Math.abs(x) < 10 * Number.EPSILON;
}

// returns a unit vector in the direction of vec, if vec is nonzero
// if vec is zero, returns 0
export function unitVector(vec, round = identity) {
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

export function vectorLength(vec) {
    let sum = 0;

    for (let i = 0; i < vec.length; i++) {
        sum += vec[i] ** 2;
    }

    return Math.sqrt(sum);
}

export function vectorAdd(v, w) {
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

export function scalarMultiply(vec, s) {
    let newVec = [];
    for (let i = 0; i < vec.length; i++) {
        newVec[i] = vec[i] * s;
    }
    return newVec;
}
