import { useEffect } from 'react';

import Recoil from 'recoil';
const { useRecoilState, useRecoilValue } = Recoil;

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
    const [funcValue] = useRecoilState(funcAtom);
    const arrowDensity = useRecoilValue(arrowDensityAtom);
    const arrowLength = useRecoilValue(arrowLengthAtom);
    const arrowColor = useRecoilValue(arrowColorAtom);
    const bounds = useRecoilValue(boundsAtom);

    useEffect(() => {
        if (!threeCBs) return;

        const geom = ArrowGridGeom({
            arrowDensity,
            arrowLength,
            bounds,
            func: funcValue.func
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
    }, [threeCBs, arrowDensity, arrowLength, bounds, funcValue, arrowColor]);

    return null;
}
