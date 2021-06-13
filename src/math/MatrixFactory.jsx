// mat is an array of arrays, with each inner array representing a row of the matrix

export default function MatrixFactory(mat) {
    // don't compute this until the rref function is called
    let rref_of_mat = [];

    function rows() {
        return mat.length;
    }

    function cols() {
        return Math.max(...mat.map((i) => i.length));
    }

    // returns A^n*vec
    function multiply_with_vec(vec, n = 1) {
        function add(reduction, element) {
            return reduction + element;
        }

        let vec1 = vec;
        let vec_ar = [vec];
        for (let i = 1; i <= n; i++) {
            vec1 = mat.map((i) => i.map((j, index) => j * vec1[index]).reduce(add, 0));
            vec_ar.push(vec1);
        }

        return vec1;
    }

    // seems like this shouldn't need any loops
    function set_entry(i, j, value) {
        for (let row = 0; row < mat.length; row++) {
            for (let col = 0; col < mat[row].length; col++) {
                if (i === row && j === col) {
                    mat[row][col] = value;
                }
            }
        }
    }

    function add(sec_mat) {
        return MatrixFactory(
            mat.map((row, i) =>
                row.map((col, j) => Number(mat[i][j]) + Number(sec_mat.get_entry(i, j)))
            )
        );
    }

    function scalar_multiply(s) {
        return MatrixFactory(mat.map((row, i) => row.map((col, j) => s * Number(mat[i][j]))));
    }

    function get_entry(i, j) {
        return mat[i][j];
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
    function vert_concat(mat2) {
        return MatrixFactory(mat.concat(mat2.getArray()));
    }

    function horiz_concat(mat2) {
        return transpose().vert_concat(mat2.transpose()).transpose();
    }

    // returns new matrix with rows i and j swapped
    function row_op_swap(i, j) {
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
    function row_op_mult(n, i) {
        let new_mat = mat.map((r, index) => {
            if (index !== i) {
                return r;
            }
            return mat[i].map((x) => n * x);
        });

        return MatrixFactory(new_mat);
    }

    // returns new matrix with n*row i subtracted from row j
    function row_op_subtract(n, i, j) {
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
        if (rref_of_mat.length > 0) {
            return rref_of_mat;
        }

        let lead_col = 0;
        let new_mat = MatrixFactory(mat);
        let i;

        for (let r = 0; r < rows(); r++) {
            if (cols() <= lead_col) {
                return new_mat;
            }

            i = r;
            while (Math.abs(new_mat.get_entry(i, lead_col)) < Number.EPSILON) {
                i = i + 1;
                if (rows() === i) {
                    i = r;
                    if (cols() === lead_col) {
                        return new_mat;
                    }
                    lead_col = lead_col + 1;
                }
            }

            new_mat = new_mat.row_op_swap(i, r);

            if (Math.abs(new_mat.get_entry(r, lead_col)) > Number.EPSILON) {
                new_mat = new_mat.row_op_mult(1 / new_mat.get_entry(r, lead_col), r);
                for (let j = 0; j < rows(); j++) {
                    if (j !== r) {
                        new_mat = new_mat.row_op_subtract(new_mat.get_entry(j, lead_col), r, j);
                    }
                }
            }

            lead_col = lead_col + 1;
        }
        rref_of_mat = MatrixFactory(
            new_mat.getArray().map((row, i) =>
                row.map((col, j) => {
                    if (Math.abs(new_mat.get_entry(i, j)) > Number.EPSILON) {
                        return Number(new_mat.get_entry(i, j).toPrecision(10));
                    }
                    return 0;
                })
            )
        );
        return rref_of_mat;
    }

    // returns an array with entries the ordered list of columns that contain a leading 1
    function pivot_cols() {
        // this will have an entry for each row
        let piv_ar = rref()
            .getArray()
            .map((r) => r.indexOf(1));

        // the rows of zeros will contribute -1; will get rid of these
        let i = piv_ar.indexOf(-1);
        if (i < 0) return piv_ar;
        return piv_ar.slice(0, i);
    }

    function basis_null_space() {
        let pc = pivot_cols();
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
                return -rref().get_entry(pc.indexOf(j), i);
            });
        });
        return basis_ar;
    }

    return {
        multiply_with_vec,
        rows,
        cols,
        add,
        scalar_multiply,
        set_entry,
        get_entry,
        row_op_swap,
        row_op_subtract,
        row_op_mult,
        rref,
        getArray,
        transpose,
        vert_concat,
        basis_null_space,
        pivot_cols,
        horiz_concat
    };
}

function identityMatrixFactory(n) {
    let arr = new Array(n).fill(0);
    arr = arr.map((v) => new Array(n).fill(0));
    arr = arr.map((row, i) =>
        row.map((col, j) => {
            if (i === j) {
                return 1;
            }
            return 0;
        })
    );

    return MatrixFactory(arr);
}
