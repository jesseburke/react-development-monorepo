import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.jsx';

// compArray is an array of arrays; each array is a chain of points to be drawn
export default function CurvedPathGeom({
    compArray,
    // this is the max no of line segments in a component
    maxSegLength = 20,
    tubularSegments = 1064,
    radius = 0.05,
    radialSegments = 4
}) {
    const geomArray = [];
    let curve, curArray, nextPt, l, tempD;

    for (let i = 0; i < compArray.length; i++) {
        curArray = compArray[i];
        l = curArray.length;

        //
        for (let k = 0; k < Math.floor(l / maxSegLength); k++) {
            curve = curveSeg(curArray.slice(k * maxSegLength, (k + 1) * maxSegLength + 1));

            geomArray.push(
                new THREE.TubeBufferGeometry(curve, tubularSegments, radius, radialSegments, false)
            );
        }

        tempD = l - maxSegLength * Math.floor(l / maxSegLength);

        if (tempD === 0) continue;
        else if (tempD === 1) curve = new THREE.LineCurve3(curArray[l - 2], curArray[l - 1]);
        else curve = curveSeg(curArray.slice(maxSegLength * Math.floor(l / maxSegLength), l));

        geomArray.push(
            new THREE.TubeBufferGeometry(curve, tubularSegments, radius, radialSegments, false)
        );
    }

    if (geomArray.length === 0) return null;

    return BufferGeometryUtils.mergeBufferGeometries(geomArray);
}

function curveSeg(pointArray) {
    const l = pointArray.length;

    let curve = new THREE.CurvePath();

    // for( let i = 0; i < Math.floor((l-1)/2); i++ ) {

    // 	curve.add( new THREE.CatmullRomCurve3([ pointArray[2*i], pointArray[2*i+1], pointArray[2*i+2] ]) );

    // }

    // if( l % 2 === 0 )
    // 	curve.add( new THREE.LineCurve3( pointArray[l-2], pointArray[l-1] ) );

    for (let i = 0; i < l - 1; i++) {
        curve.add(new THREE.LineCurve3(pointArray[i], pointArray[i + 1]));
    }

    return curve;
}
