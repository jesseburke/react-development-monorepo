import React, { useEffect, useLayoutEffect, useState } from 'react';

import { atom, useAtom, PrimitiveAtom } from 'jotai';

import * as THREE from 'three';

import DirectionFieldApproxGeom from '../geometries/DirectionFieldApprox.jsx';
import DraggableSphere from './DraggableSphere.jsx';

import { ArrayPoint2, Bounds2, CurveData2 } from '../my-types';

export interface DirectionFieldApproxProps {
    threeCBs?: Function;
    diffEqAtom: PrimitiveAtom<Function>;
    initialPointAtom: PrimitiveAtom<ArrayPoint2>;
    boundsAtom: PrimitiveAtom<Bounds2>;
    curveDataAtom: PrimitiveAtom<CurveData2>;
    radius: number;
}

export default function IntegralCurve({
    threeCBs,
    diffEqAtom,
    initialPointAtom = null,
    boundsAtom,
    curveDataAtom,
    zHeightAtom,
    radius = 0.05
}) {
    const [mat, setMat] = useState();

    const [meshState, setMeshState] = useState();

    const initialPt = useAtom(initialPointAtom)[0];

    const func = useAtom(diffEqAtom)[0];

    const bounds = useAtom(boundsAtom)[0];

    const { visible, color, approxH, width } = useAtom(curveDataAtom)[0];

    const sphereColorAtom = atom((get) => get(curveDataAtom).color);

    const zHeightFunc = zHeightAtom ? useAtom(zHeightAtom)[0].func : (x, y) => 0;

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
            radius: width,
            zHeightFunc
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

    return visible ? (
        <DraggableSphere
            threeCBs={threeCBs}
            colorAtom={sphereColorAtom}
            dragPositionAtom={initialPointAtom}
            radius={(0.25 * width) / 0.1}
            funcAtom={diffEqAtom}
            zHeightAtom={zHeightAtom}
        />
    ) : null;
}
