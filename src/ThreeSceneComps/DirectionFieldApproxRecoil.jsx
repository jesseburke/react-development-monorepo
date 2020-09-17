import React, { useEffect, useLayoutEffect, useState } from 'react';

import { useAtom } from 'jotai';

import * as THREE from 'three';

import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.jsx';
import Sphere from './SphereRecoil.jsx';

const defaultWidth = 0.1;

export default function DirectionFieldApprox({
    threeCBs,
    funcAtom,
    initialPointAtom = null,
    boundsAtom,
    solutionCurveOptionsAtom,
    radius = 0.05
}) {
    const [mat, setMat] = useState();

    const [meshState, setMeshState] = useState();

    const [initialPt] = useAtom(initialPointAtom);

    const [func] = useAtom(funcAtom);

    const [bounds] = useAtom(boundsAtom);

    const { visible, color, approxH, width } = useAtom(solutionCurveOptionsAtom)[0];

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
            radius: width
        });

        const mesh = new THREE.Mesh(dfag, mat);

        threeCBs.add(mesh);
        setMeshState(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (dfag) dfag.dispose();
            if (mat) mat.dispose();
        };
    }, [threeCBs, initialPt, bounds, func, width, approxH, mat, radius, visible]);

    return (
        <Sphere
            threeCBs={threeCBs}
            color={color}
            dragPositionAtom={initialPointAtom}
            radius={0.25}
        />
    );
}
