import { useEffect } from 'react';

import { useAtom } from 'jotai';

import * as THREE from 'three';

import ArrowGridGeom from '../graphics/ArrowGridGeom.jsx';

export default function ArrowGrid({
    threeCBs,
    funcAtom,
    boundsAtom,
    arrowDensityAtom,
    arrowLengthAtom,
    arrowColorAtom,
    arrowThicknessAtom
}) {
    const [arrowDensity] = useAtom(arrowDensityAtom);
    const [arrowLength] = useAtom(arrowLengthAtom);
    const [arrowThickness] = useAtom(arrowThicknessAtom);
    const [arrowColor] = useAtom(arrowColorAtom);
    const [func] = useAtom(funcAtom);
    const [bounds] = useAtom(boundsAtom);

    useEffect(() => {
        if (!threeCBs) return;

        const geom = ArrowGridGeom({
            arrowDensity,
            arrowLength,
            arrowThickness,
            bounds,
            func: func.func //funcValue.func
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
    }, [threeCBs, arrowDensity, arrowLength, arrowThickness, bounds, func, arrowColor]);

    return null;
}
