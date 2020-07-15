import { eGCD } from '../utils/BaseUtils.jsx';
import RationalRotationFactory from './RationalRotationFactory.jsx';

// represents the Cyclic Subgroup generated by a rotation
//

export default function RationalRotationCSFactory(m, n) {
    if (!Number.isInteger(m) || !Number.isInteger(n)) {
        console.log(
            'RationalRotationFactory was called with a non-integer argument; returned null'
        );
        return;
    }

    if (m < 0 || n <= 0) {
        console.log(
            'RationalRotationFactory was called with a non-positive integer argument; returned null'
        );
        return;
    }

    const { gcd, aCoeff, bCoeff } = eGCD(m, 360 * n);

    const order = (360 * n) / gcd;

    const theta = gcd / n;

    const eltArray = [];

    for (let i = 1; i < order; i++) {
        eltArray.push(RationalRotationFactory(gcd * i, n));
    }

    function getElementArray() {
        return eltArray;
    }

    function getOrder() {
        return order;
    }

    // returns array of new THREE.Vector3

    function transformPoint(pt) {
        return eltArray.map((r) => r.transformPointt(pt));
    }

    //returns array of geometries

    function transformGeometry(geom) {
        return eltArray.map((r) => r.transformGeometry(geom));
    }

    // returns array of meshes

    function transformMesh(mesh) {
        return eltArray.map((r) => r.transformMesh(mesh));
    }

    return { transformPoint, transformMesh, transformGeometry, getElementArray, getOrder };
}

const degToRad = (deg) => deg * 0.0174533;
