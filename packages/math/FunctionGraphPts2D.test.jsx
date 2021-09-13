import FunctionGraphPts2D from './FunctionGraphPts2D';

const testFunc1 = (x) => Math.sin(x ^ (2 + 1));
const testFunc2 = (x) => x ** 3 - 2 * x;
const testBounds = { xMin: -10, yMin: -5, xMax: 10, yMax: 10 };

const comps1 = FunctionGraphPts2D({ func: testFunc1, bounds: testBounds, approxH: 0.1 });
const comps2 = FunctionGraphPts2D({ func: testFunc2, bounds: testBounds, approxH: 0.1 });

test('returned points are within bounds', () => {
    comps1.forEach((ptArray) => {
        ptArray.forEach(([x, y]) => {
            expect(x).toBeLessThanOrEqual(testBounds.xMax);
            expect(x).toBeGreaterThanOrEqual(testBounds.xMin);

            expect(y).toBeLessThanOrEqual(testBounds.yMax);
            expect(y).toBeGreaterThanOrEqual(testBounds.yMin);
        });
    });

    comps2.forEach((ptArray) => {
        ptArray.forEach(([x, y]) => {
            expect(x).toBeLessThanOrEqual(testBounds.xMax);
            expect(x).toBeGreaterThanOrEqual(testBounds.xMin);

            expect(y).toBeLessThanOrEqual(testBounds.yMax);
            expect(y).toBeGreaterThanOrEqual(testBounds.yMin);
        });
    });
});

test('returned points are on function graph', () => {
    comps1.forEach((ptArray) =>
        ptArray.forEach(([x, y]) => expect(testFunc1(x)).toBeCloseTo(y, 1))
    );

    comps2.forEach((ptArray) =>
        ptArray.forEach(([x, y]) => expect(testFunc2(x)).toBeCloseTo(y, 1))
    );
});
