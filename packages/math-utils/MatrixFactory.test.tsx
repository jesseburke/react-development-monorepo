import { MatrixFactory } from './MatrixFactory';

let testMat = MatrixFactory([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]);

test('multiplyWithVec', () => {
    let testVec = [1, 1, 1];
    let testVec2 = [1, 0, 0];

    expect(testMat.multiplyWithVec(testVec)).toEqual([6, 15, 24]);

    expect(testMat.multiplyWithVec(testVec2)).toEqual([1, 4, 7]);
});

test('add', () => {
    let secMat = MatrixFactory([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]);

    expect(testMat.add(secMat).getArray()).toEqual([
        [2, 2, 3],
        [4, 6, 6],
        [7, 8, 10]
    ]);
});

test('scalarMultiply', () => {
    expect(testMat.scalarMultiply(2).getArray()).toEqual([
        [2, 4, 6],
        [8, 10, 12],
        [14, 16, 18]
    ]);
});

test('transpose', () => {
    expect(testMat.transpose().getArray()).toEqual([
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9]
    ]);
});

test('row operations', () => {
    expect(testMat.rowOpSwap(0, 2).getArray()).toEqual([
        [7, 8, 9],
        [4, 5, 6],
        [1, 2, 3]
    ]);

    expect(testMat.rowOpMult(2, 0).getArray()).toEqual([
        [2, 4, 6],
        [4, 5, 6],
        [7, 8, 9]
    ]);

    expect(testMat.rowOpSubtract(2, 0, 2).getArray()).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [5, 4, 3]
    ]);
});

test('rref', () => {
    expect(testMat.rref().getArray()).toEqual([
        [1, 0, -1],
        [0, 1, 2],
        [0, 0, 0]
    ]);
});

test('pivot cols', () => {
    expect(testMat.pivotCols()).toEqual([0, 1]);
});

// not sure how to test null space...would need to be able to check
// equality of subspaces (and linear independence, but use rref)
