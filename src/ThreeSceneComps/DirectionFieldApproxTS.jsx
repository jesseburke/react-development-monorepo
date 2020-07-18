import { useEffect, useRef } from 'react';

import * as THREE from 'three';

import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.jsx';

export default function DirectionFieldApproxTS({
    threeCBs,
    func,
    initialPt,
    color,
    bounds = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    approxH = 0.01,
    radius = 0.05
}) {
    const mat = useRef(material(color));

    useEffect(() => {
        mat.current = material(color);

        return () => {
            mat.current.dispose();
        };
    }, [color]);

    useEffect(() => {
        if (!threeCBs) return;

        const dfag = DirectionFieldApproxGeom({
            func,
            initialPt,
            bounds,
            h: approxH,
            radius
        });

        const mesh = new THREE.Mesh(dfag, mat);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (dfag) dfag.dispose();
        };
    }, [threeCBs, initialPt, bounds, func, approxH]);

    return null;
}

const material = (color) => {
    const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        side: THREE.FrontSide
    });

    mat.transparent = true;
    mat.opacity = 0.6;

    return mat;
};
