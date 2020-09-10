import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

const defaultVisibleAtom = atom(true);

const defaultColorAtom = atom('#3285ab');

export default React.memo(function Line({
    threeCBs,
    radius = 0.1,
    colorAtom = defaultColorAtom,
    point1Atom,
    point2Atom,
    visibleAtom = defaultVisibleAtom
}) {
    const [meshState, setMeshState] = useState();

    const [visible] = useAtom(visibleAtom);

    const [color] = useAtom(colorAtom);

    const [point1] = useAtom(point1Atom);

    const [point2] = useAtom(point2Atom);

    //------------------------------------------------------------------------
    //
    // sets up the mesh
    //

    useEffect(() => {
        if (!threeCBs) {
            setMeshState((s) => s);
            return;
        }

        if (!visible) {
            if (meshState) threeCBs.remove(meshState);
            setMeshState(null);
            return;
        }

        const path = new THREE.LineCurve3(
            new THREE.Vector3(point1[0], point1[1]),
            new THREE.Vector3(point2[0], point2[1])
        );

        const geometry = new THREE.TubeBufferGeometry(path, 16, radius, 8, false);
        const material = new THREE.MeshBasicMaterial({ color });

        const mesh = new THREE.Mesh(geometry, material);

        threeCBs.add(mesh);
        setMeshState(mesh);

        return () => {
            if (mesh) threeCBs.remove(mesh);
            if (geometry) geometry.dispose();
            if (material) material.dispose();
        };
    }, [visible, color, radius, threeCBs, point1, point2]);

    return null;
});
