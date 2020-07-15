import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.jsx';

// output has middle at origin; arrow is parallel to y-axis
// base of arrow is at (0, -length/2) and tip of arrow is at (0, length/2)

export default function ArrowGeometry({ length }) {
    const rawGeom = RawArrowGeometry({
        baseLength: 1.25,
        baseRadius: 0.1,
        tipLength: 0.75,
        tipRadius: 0.35
    });

    // the 2 is the length of the raw arrow above
    rawGeom.scale(length / 2, length / 2, length / 2);

    return rawGeom;
}

function RawArrowGeometry({ baseLength, baseRadius, tipLength, tipRadius }) {
    const radiusTop = baseRadius;
    const radiusBottom = baseRadius;
    let height = baseLength;
    let radialSegments = 8;
    let heightSegments = 1;
    let openEnded = false;

    const base = new THREE.CylinderBufferGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
        heightSegments,
        openEnded
    );

    const radius = tipRadius;
    height = tipLength;
    radialSegments = 8;
    heightSegments = 1;
    openEnded = false;

    const tip = new THREE.ConeBufferGeometry(
        radius,
        height,
        radialSegments,
        heightSegments,
        openEnded
    );

    // moves up so origin is at base
    tip.translate(0, tipLength / 2 + baseLength, 0);
    base.translate(0, baseLength / 2, 0);

    let geometries = [base, tip];

    const arrowGeom = BufferGeometryUtils.mergeBufferGeometries(geometries);

    // move so origin is through center of arrow
    //arrowGeom.translate(0, -(baseLength + tipLength)/2, 0);

    return arrowGeom;
}
