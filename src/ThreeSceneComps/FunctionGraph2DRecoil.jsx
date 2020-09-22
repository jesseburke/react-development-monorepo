import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import FunctionGraph2DGeom from '../graphics/FunctionGraph2DGeom.jsx';

export default function FunctionGraph2D({ threeCBs, funcAtom, boundsAtom, curveOptionsAtom }) {
    const func = useAtom(funcAtom)[0];
    const bounds = useAtom(boundsAtom)[0];
    const { color, approxH, width, visible } = useAtom(curveOptionsAtom)[0];

    useEffect(() => {
        if (!threeCBs || !visible || !func) return;

        const geom = FunctionGraph2DGeom({
            func: func.func,
            approxH,
            radius: width,
            bounds
        });

        if (!geom) return;

        const mesh = new THREE.Mesh(geom, testFuncMaterial(color));

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (geom) geom.dispose();
        };
    }, [threeCBs, func, bounds, color, visible, width, approxH]);

    return null;
}

const testFuncMaterial = function (color) {
    const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        side: THREE.FrontSide
    });
    mat.transparent = true;
    mat.opacity = 0.6;

    return mat;
};
