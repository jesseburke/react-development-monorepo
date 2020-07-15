import { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

export default function useGridAndOrigin({
    threeCBs,
    gridQuadSize = 20,
    center = [0, 0],
    gridShow = true,
    originColor = 0x3f405c,
    originRadius = 0.25,
    gridCB = () => null
}) {
    useEffect(() => {
        if (!gridShow || !threeCBs) return;

        const grid = new THREE.GridHelper(2 * gridQuadSize, 2 * gridQuadSize);

        grid.material.opacity = 0.4;
        grid.material.transparent = true;
        grid.translateX(center[0]);
        grid.translateY(center[1]);
        grid.rotateX(Math.PI / 2);

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
    }, [threeCBs, gridQuadSize, center, gridShow, originColor]);
}
