import { useEffect } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import ArrowGridGeom from '../graphics/ArrowGridGeom.jsx';

export default function ArrowGrid({ threeCBs, funcAtom, boundsAtom, arrowGridDataAtom }) {
    // const [density] = useAtom(arrowDensityAtom);
    // const [length] = useAtom(arrowLengthAtom);
    // const [thickness] = useAtom(arrowThicknessAtom);
    // const [color] = useAtom(arrowColorAtom);

    const { density, length, thickness, color } = useAtom(arrowGridDataAtom)[0];

    const [func] = useAtom(funcAtom);
    const [bounds] = useAtom(boundsAtom);

    useEffect(() => {
        if (!threeCBs) return;

        const geom = ArrowGridGeom({
            arrowDensity: density,
            arrowLength: length,
            arrowThickness: thickness,
            bounds,
            func: func.func //funcValue.func
        });

        const material = new THREE.MeshBasicMaterial({ color });
        //material.transparent = true;
        //material.opacity = .75;

        const mesh = new THREE.Mesh(geom, material);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (geom) geom.dispose();
            if (material) material.dispose();
        };
    }, [threeCBs, density, length, thickness, bounds, func, color]);

    return null;
}
