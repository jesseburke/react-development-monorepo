// mat is an array of arrays, with each inner array representing a row
// of the matrix

export interface MyMatrix {
    rows: () => number;
    cols: () => number;
    multiplyWithVec: (vec: number[]) => number[];
    getEntry: (i: number, j: number) => number;
    setEntry: (i: number, j: number, value: number) => void;
    add: (secMatrix: MyMatrix) => MyMatrix;
}

type MathMatrix = ReturnType<typeof MatrixFactory>;

export function MatrixFactory(mat: number[][]) {
    // don't compute this until the rref function is called
    let rref_of_mat: number[][];

    function rows() {
        return mat.length;
    }

    function cols() {
        return Math.max(...mat.map((i) => i.length));
    }

    // returns A^n*vec
    function multiplyWithVec(vec: number[], n = 1) {
        return mat.map((row) => row.map((entry, j) => entry * vec[j]).reduce((x, y) => x + y));
    }

    function getEntry(i: number, j: number) {
        return mat[i][j];
    }

    function setEntry(i: number, j: number, value: number) {
        mat[i][j] = value;
    }

    function add(secMat: MathMatrix) {
        return MatrixFactory(
            mat.map((row, i) =>
                row.map((_, j) => Number(mat[i][j]) + Number(secMat.getEntry(i, j)))
            )
        );
    }

    function scalarMultiply(s: number) {
        return MatrixFactory(mat.map((row, i) => row.map((_, j) => s * Number(mat[i][j]))));
    }

    function getArray() {
        return mat;
    }

    function transpose() {
        let new_ar = [];

        for (let i = 0; i < cols(); i++) {
            new_ar[i] = mat.map((v) => v[i]);
        }

        return MatrixFactory(new_ar);
    }

    // returns mat2 stacked under mat
    function vertConcat(mat2: MathMatrix) {
        return MatrixFactory(mat.concat(mat2.getArray()));
    }

    function horizConcat(mat2: MathMatrix) {
        return transpose().vertConcat(mat2.transpose()).transpose();
    }

    // returns new matrix with rows i and j swapped
    function rowOpSwap(i: number, j: number) {
        let new_mat = mat.map((r, index) => {
            if (index === j) {
                return mat[i];
            }
            return r;
        });
        new_mat[i] = mat[j];

        return MatrixFactory(new_mat);
    }

    // returns new matrix with row i multiplied by n
    function rowOpMult(n: number, i: number) {
        let new_mat = mat.map((r, index) => {
            if (index !== i) {
                return r;
            }
            return mat[i].map((x) => n * x);
        });

        return MatrixFactory(new_mat);
    }

    // returns new matrix with n*row i subtracted from row j
    function rowOpSubtract(n: number, i: number, j: number) {
        let new_mat = mat.map((r, index) => {
            if (index !== j) {
                return r;
            }
            return mat[j].map((x, k) => mat[j][k] - n * mat[i][k]);
        });

        return MatrixFactory(new_mat);
    }

    // algorithm adapted from https://rosettacode.org/wiki/Reduced_row_echelon_form#JavaScript
    function rref() {
        if (rref_of_mat) {
            return MatrixFactory(rref_of_mat);
        }

        let lead_col = 0;
        let new_mat = MatrixFactory(mat);
        let i: number;

        for (let r = 0; r < rows(); r++) {
            if (cols() <= lead_col) {
                return new_mat;
            }

            i = r;
            while (Math.abs(new_mat.getEntry(i, lead_col)) < Number.EPSILON) {
                i = i + 1;
                if (rows() === i) {
                    i = r;
                    if (cols() === lead_col) {
                        return new_mat;
                    }
                    lead_col = lead_col + 1;
                }
            }

            new_mat = new_mat.rowOpSwap(i, r);

            if (Math.abs(new_mat.getEntry(r, lead_col)) > Number.EPSILON) {
                new_mat = new_mat.rowOpMult(1 / new_mat.getEntry(r, lead_col), r);
                for (let j = 0; j < rows(); j++) {
                    if (j !== r) {
                        new_mat = new_mat.rowOpSubtract(new_mat.getEntry(j, lead_col), r, j);
                    }
                }
            }

            lead_col = lead_col + 1;
        }
        const rv = MatrixFactory(
            new_mat.getArray().map((row, i) =>
                row.map((_, j) => {
                    if (Math.abs(new_mat.getEntry(i, j)) > Number.EPSILON) {
                        return Number(new_mat.getEntry(i, j).toPrecision(10));
                    }
                    return 0;
                })
            )
        );
        rref_of_mat = rv.getArray();

        return rv;
    }

    // returns an array with entries the ordered list of columns that contain a leading 1
    function pivotCols() {
        // this will have an entry for each row
        let piv_ar = rref()
            .getArray()
            .map((r) => r.indexOf(1));

        // the rows of zeros will contribute -1; will get rid of these
        let i = piv_ar.indexOf(-1);
        if (i < 0) return piv_ar;
        return piv_ar.slice(0, i);
    }

    function basisNullSpace() {
        let pc = pivotCols();
        let npc = [];

        for (let i = 0; i < cols(); i++) {
            if (pc.indexOf(i) === -1) {
                npc.push(i);
            }
        }

        let basis_ar = npc.map((i) => {
            let ar = Array(cols()).fill(0);
            return ar.map((k, j) => {
                if (j === i) {
                    return 1;
                }
                if (npc.indexOf(j) >= 0) {
                    return 0;
                }
                return -rref().getEntry(pc.indexOf(j), i);
            });
        });
        return basis_ar;
    }

    return {
        multiplyWithVec,
        rows,
        cols,
        add,
        scalarMultiply,
        setEntry,
        getEntry,
        getArray,
        transpose,
        vertConcat,
        horizConcat,
        rowOpSwap,
        rowOpSubtract,
        rowOpMult,
        rref,
        basisNullSpace,
        pivotCols
    };
}

/* function identityMatrixFactory(n) {
 *     let arr = new Array(n).fill(0);
 *     arr = arr.map((v) => new Array(n).fill(0));
 *     arr = arr.map((row, i) =>
 *         row.map((col, j) => {
 *             if (i === j) {
 *                 return 1;
 *             }
 *             return 0;
 *         })
 *     );
 *
 *     return MatrixFactory(arr);
 * } */
