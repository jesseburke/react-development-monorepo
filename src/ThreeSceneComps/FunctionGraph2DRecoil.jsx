import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import FunctionGraph2DGeom from '../graphics/FunctionGraph2DGeom.jsx';

export default function FunctionGraph2D({
    threeCBs,
    funcAtom,
    boundsAtom,
    curveOptionsAtom,
    show = true
}) {
    const func = useAtom(funcAtom)[0];
    const bounds = useAtom(boundsAtom)[0];
    const { color } = useAtom(curveOptionsAtom)[0];

    useEffect(() => {
        if (!threeCBs || !func) return;

        const geom = FunctionGraph2DGeom({
            func: func.func,
            bounds
        });

        const mesh = new THREE.Mesh(geom, testFuncMaterial(color));

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            if (geom) geom.dispose();
        };
    }, [threeCBs, func, bounds, color]);

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
