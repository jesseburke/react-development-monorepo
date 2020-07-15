import * as THREE from 'three';

import { eGCD } from '../utils/BaseUtils.jsx';

// only does rotation about origin at the moment
//
// m/n represents the angle, in degrees, to rotate about the origin

export default function RationalRotationFactory(m, n) {
    if (!Number.isInteger(m) || !Number.isInteger(n)) {
        console.log(
            'RationalRotationFactory was called with a non-integer argument; returned null'
        );
        return;
    }

    if (m <= 0 || n <= 0) {
        console.log(
            'RationalRotationFactory was called with a non-positive integer argument; returned null'
        );
        return;
    }

    const { gcd, aCoeff, bCoeff } = eGCD(m, 360 * n);

    const nPrime = (360 * n) / gcd;

    const theta = gcd / n;

    // pure; returns new THREE.Vector3

    function transformPoint(pt) {
        const newPt = pt.clone();

        newPt.applyAxisAngle(new THREE.Vector3(0, 0, 1), m / n);

        return newPt;
    }

    // pure; returns new geometry

    function transformGeometry(geom) {
        const newGeom = geom.clone();

        newGeom.rotateZ(degToRad(m / n));

        return newGeom;
    }

    // pure; returns new mesh

    function transformMesh(mesh) {
        return mesh.clone();
    }

    // returns the smallest angle in the cyclic group generated by the rotation;
    // is gcd( 360, angle )
    function subgroupInfo() {
        return { smallAngle: { m: gcd, n }, order: nPrime };
    }

    return { subgroupInfo, transformPoint, transformMesh, transformGeometry };
}

const degToRad = (deg) => deg * 0.0174533;
