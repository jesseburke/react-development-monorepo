// func: f(x)
export function ParamGraphPts2D({ xFunc, yFunc, tBounds, approxH = 0.1 }) {
    const { tMin, tMax } = tBounds;

    if (isNaN(tMin) || isNaN(tMax)) return [];

    let ptArray = [];

    for (let i = Math.floor(tMin / approxH); i <= Math.ceil(tMax / approxH); i++) {
        ptArray.push([xFunc(approxH * i), yFunc(approxH * i)]);
    }

    return ptArray;
}
