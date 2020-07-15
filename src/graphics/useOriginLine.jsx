import { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.jsx';

export default function useOriginLine({
    threeCBs,
    // vec is a Vector3; is any non-origin point on the line
    vec,
    tubularSegments = 64,
    radius = 0.02,
    radialSegments = 4,
    closed = false,
    length = 100
}) {
    useEffect(() => {
        if (!threeCBs) return;

        vec.multiplyScalar(length);

        // make the line geometry; goes two directions from origin
        const geometry = BufferGeometryUtils.mergeBufferGeometries([
            new THREE.TubeBufferGeometry(
                new THREE.LineCurve3(vec, new THREE.Vector3(0, 0, 0)),
                tubularSegments,
                radius,
                radialSegments,
                closed
            ),
            new THREE.TubeBufferGeometry(
                new THREE.LineCurve3(vec.multiplyScalar(-1), new THREE.Vector3(0, 0, 0)),
                tubularSegments,
                radius,
                radialSegments,
                closed
            )
        ]);

        const mat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const lineMesh = new THREE.Mesh(geometry, mat);

        threeCBs.add(lineMesh);

        return () => {
            threeCBs.remove(lineMesh);
            geometry.dispose();
            mat.dispose();
        };
    }, [threeCBs, vec]);
}
