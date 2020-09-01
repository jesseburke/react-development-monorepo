import { useEffect, useLayoutEffect, useState } from 'react';
import Recoil from 'recoil';
const {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    useRecoilCallback,
    atomFamily
} = Recoil;

import * as THREE from 'three';

import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.jsx';

export default function DirectionFieldApproxTS({
    threeCBs,
    func,
    initialPtAtom = null,
    color,
    bounds = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    approxH = 0.01,
    radius = 0.05
}) {
    const [mat, setMat] = useState();

    const initialPt = useRecoilValue(initialPtAtom);

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
        if (!threeCBs) return;

        const dfag = DirectionFieldApproxGeom({
            func,
            initialPt: [initialPt.x, initialPt.y],
            bounds,
            h: approxH,
            radius
        });

        const mesh = new THREE.Mesh(dfag, mat);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (dfag) dfag.dispose();
            if (mat) mat.dispose();
        };
    }, [threeCBs, initialPt, bounds, func, approxH, mat, radius]);

    return null;
}
