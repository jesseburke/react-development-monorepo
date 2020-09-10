import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Recoil from 'recoil';
const {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    useSetRecoilState,
    useRecoilCallback,
    atomFamily
} = Recoil;

import * as THREE from 'three';

const defaultVisibleAtom = atom({ key: 'default visible atom for line', default: true });

const defaultColorAtom = atom({ key: 'default color atom for line', default: '#3285ab' });

export default React.memo(function Line({
    threeCBs,
    radius = 0.1,
    colorAtom = defaultColorAtom,
    point1Atom,
    point2Atom,
    visibleAtom = defaultVisibleAtom
}) {
    const [meshState, setMeshState] = useState();

    const visible = useRecoilValue(visibleAtom);

    const color = useRecoilValue(colorAtom);

    const point1 = useRecoilValue(point1Atom);

    const point2 = useRecoilValue(point2Atom);

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
