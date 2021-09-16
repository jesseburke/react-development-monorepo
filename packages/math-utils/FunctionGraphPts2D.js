// func: f(x)
export function FunctionGraphPts2D({ func, bounds, approxH = 0.1 }) {
    const { xMin, xMax, yMin, yMax } = bounds;

    if (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)) return [];

    let compArray = [];
    let curArray = [];

    let x0, y0, tx, ty, lastOutPt;

    for (let i = Math.floor(xMin / approxH); i <= Math.ceil(xMax / approxH); i++) {
        tx = i * approxH;
        ty = func(tx);

        if (ty === Infinity) ty = Number.MAX_SAFE_INTEGER;
        else if (isNaN(ty)) {
            tx = i * approxH - 10 / Number.MAX_SAFE_INTEGER;
            ty = func(tx);
            helper(tx, ty);
            tx = i * approxH + 10 / Number.MAX_SAFE_INTEGER;
            ty = func(tx);
            helper(tx, ty);
        } else helper(tx, ty);
    }

    if (curArray.length > 0) compArray.push(curArray);

    function helper(tx, ty) {
        // if out of bounds, will try to add point on the boundary (but potentially off the x-grid)
        if (ty < yMin) {
            // were out of bounds below previous iteration
            if (curArray.length === 0) {
                // were out of bounds above previous iteration, so now
                // want to add line interpolating between those two points
                if (lastOutPt && lastOutPt[1] === 'a') {
                    const [x0, y0] = lastOutPt[0];

                    // tx - x0 is nonzero by construction
                    const m = (ty - y0) / (tx - x0);
                    compArray.push([
                        [x0 + (yMax - y0) / m, yMax],
                        [x0 + (yMin - y0) / m, yMin]
                    ]);
                }

                lastOutPt = [[tx, ty], 'b'];
                return;
            }

            // otherwise, to draw equation until edge of bounds, will do linear
            // approximation for the last bit

            [x0, y0] = curArray[curArray.length - 1];
            const m = (ty - y0) / (tx - x0);
            curArray.push([x0 + (yMin - y0) / m, yMin]);
            compArray.push(curArray);
            curArray = [];
            lastOutPt = [[tx, ty], 'b'];
            return;
        } else if (ty > yMax) {
            // were out of bounds below previous iteration
            if (curArray.length === 0) {
                // were out of bounds below previous iteration, so now
                // want to add line interpolating between those two points
                if (lastOutPt && lastOutPt[1] === 'b') {
                    const [x0, y0] = lastOutPt[0];

                    // tx - x0 is nonzero by construction
                    const m = (ty - y0) / (tx - x0);
                    compArray.push([
                        [x0 + (yMin - y0) / m, yMin],
                        [x0 + (yMax - y0) / m, yMax]
                    ]);
                }

                lastOutPt = [[tx, ty], 'a'];
                return;
            }

            // otherwise, to draw equation until edge of bounds, will do linear
            // approximation for the last bit

            [x0, y0] = curArray[curArray.length - 1];
            const m = (ty - y0) / (tx - x0);
            curArray.push([x0 + (yMax - y0) / m, yMax]);
            compArray.push(curArray);
            curArray = [];
            lastOutPt = [[tx, ty], 'a'];
            return;
        }

        // if curArray is empty, then will add point on the boundary
        if (curArray.length === 0 && lastOutPt) {
            [x0, y0] = lastOutPt[0];

            const m = (ty - y0) / (tx - x0);

            if (y0 > yMax) {
                curArray.push([x0 + (yMax - y0) / m, yMax]);
            } else if (y0 < yMin) {
                curArray.push([x0 + (yMin - y0) / m, yMin]);
            } else {
                curArray.push([x0, y0]);
            }
        }
        curArray.push([tx, ty]);
    }

    return compArray;
}
