import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import FunctionGraph3DGeom from '../graphics/FunctionGraph3DGeom.jsx';

export default React.memo(function FunctionGraph3DTS({
    threeCBs,
    func,
    bounds,
    color,
    show = true
}) {
    useEffect(() => {
        if (!threeCBs) return;

        const geometry = FunctionGraph3DGeom({
            func,
            bounds: { ...bounds, yMin: bounds.tMin, yMax: bounds.tMax },
            meshSize: 200
        });

        const material = new THREE.MeshNormalMaterial({
            color,
            side: THREE.DoubleSide
        });
        material.shininess = 0;
        //material.transparent = true;
        //material.opacity = .6;
        //material.wireframe = true;

        BufferGeometryUtils.computeTangents(geometry);

        const mesh = new THREE.Mesh(geometry, material);
        threeCBs.add(mesh);

        const helper = new THREE.VertexNormalsHelper(mesh, 0.25, 0x000000, 10);
        //threeCBs.add(helper);

        //const helper1 = new VertexTangentsHelper( mesh, .25, 0x000000, 10 );
        //threeCBs.add(helper1);

        return () => {
            threeCBs.remove(mesh);
            geometry.dispose();
            material.dispose();
        };
    }, [threeCBs, func, color, bounds]);

    return null;
});
