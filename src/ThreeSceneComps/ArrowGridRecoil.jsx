import { useEffect } from 'react';

import { useAtom } from 'jotai';

import * as THREE from 'three';

import ArrowGridGeom from '../graphics/ArrowGridGeom.jsx';

export default function ArrowGrid({
    threeCBs,
    funcAtom,
    //bounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 },
    boundsAtom,
    arrowDensityAtom,
    arrowLengthAtom,
    arrowColorAtom
}) {
    const [arrowDensity] = useAtom(arrowDensityAtom);
    const [arrowLength] = useAtom(arrowLengthAtom);
    const [arrowColor] = useAtom(arrowColorAtom);
    const [funcj] = useAtom(funcAtom);
    const [bounds] = useAtom(boundsAtom);

    useEffect(() => {
        if (!threeCBs) return;

        const geom = ArrowGridGeom({
            arrowDensity,
            arrowLength,
            bounds,
            func: funcj.func //funcValue.func
        });

        const material = new THREE.MeshBasicMaterial({ color: arrowColor });
        //material.transparent = true;
        //material.opacity = .75;

        const mesh = new THREE.Mesh(geom, material);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (geom) geom.dispose();
            if (material) material.dispose();
        };
    }, [threeCBs, arrowDensity, arrowLength, bounds, funcj, arrowColor]);

    return null;
}
