import * as React from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import GridGeometry from '../graphics/GridGeom.js';

export default React.memo(function GridAndOriginTS({
    threeCBs,
    center = [0, 0],
    gridShow = true,
    boundsAtom,
    originColor = 0x3f405c,
    originRadius = 0.25,
    gridCB = () => null
}) {
    const { xMax, xMin, yMax, yMin } = useAtom(boundsAtom)[0];

    React.useEffect(() => {
        if (!gridShow || !threeCBs) return;

        const grid = GridGeometry({ length: yMax - yMin, width: xMax - xMin, llc: [xMin, yMin] });

        threeCBs.add(grid);

        if (gridCB) gridCB(grid);

        const geometry = new THREE.SphereBufferGeometry(originRadius, 15, 15);
        const material = new THREE.MeshBasicMaterial({ color: originColor });

        let origin;
        if (originRadius > 0) {
            origin = new THREE.Mesh(geometry, material);
            threeCBs.add(origin);
        }

        return () => {
            if (grid) threeCBs.remove(grid);
            if (origin) threeCBs.remove(origin);
            geometry.dispose();
            material.dispose();
        };
    }, [threeCBs, center, gridShow, originColor, gridCB, originRadius, xMax, xMin, yMax, yMin]);

    return null;
});
