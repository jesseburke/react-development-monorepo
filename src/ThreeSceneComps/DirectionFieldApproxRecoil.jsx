import { useEffect, useLayoutEffect, useState } from 'react';

import { useAtom } from 'jotai';

import * as THREE from 'three';

import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.jsx';

export default function DirectionFieldApprox({
    threeCBs,
    funcAtom,
    initialPtAtom = null,
    color,
    boundsAtom,
    approxH = 0.01,
    radius = 0.05,
    visibleAtom
}) {
    const [mat, setMat] = useState();

    const [meshState, setMeshState] = useState();

    const [initialPt] = useAtom(initialPtAtom);

    const [visible] = useAtom(visibleAtom);

    const [func] = useAtom(funcAtom);

    const [bounds] = useAtom(boundsAtom);

    useEffect(() => {
        setMat(
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(color),
                side: THREE.FrontSide,
                transparent: true,
                opacity: 0.6
            })
        );

        return () => {
            if (mat) mat.dispose();
        };
    }, [color]);

    useEffect(() => {
        if (!threeCBs) {
            setMeshState((s) => s);
            return;
        }

        if (!visible) {
            threeCBs.remove(meshState);
            setMeshState(null);
            return;
        }

        const dfag = DirectionFieldApproxGeom({
            func: func.func,
            initialPt: [initialPt.x, initialPt.y],
            bounds,
            h: approxH,
            radius
        });

        const mesh = new THREE.Mesh(dfag, mat);

        threeCBs.add(mesh);
        setMeshState(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (dfag) dfag.dispose();
            if (mat) mat.dispose();
        };
    }, [threeCBs, initialPt, bounds, func, approxH, mat, radius, visible]);

    return null;
}
