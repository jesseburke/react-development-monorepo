import { useEffect } from 'react';

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

import ArrowGridGeom from '../graphics/ArrowGridGeom.jsx';

export default function ArrowGrid({
    threeCBs,
    funcAtom,
    bounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 },
    arrowDensity,
    arrowLength,
    color = '#0A2C3C'
}) {
    const funcValue = useRecoilValue(funcAtom);

    useEffect(() => {
        if (!threeCBs) return;

        const geom = ArrowGridGeom({
            arrowDensity,
            arrowLength,
            bounds,
            func: funcValue.func
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
    }, [threeCBs, arrowDensity, arrowLength, bounds, funcValue, color]);

    return null;
}
