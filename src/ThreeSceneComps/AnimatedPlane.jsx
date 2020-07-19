import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

export default React.memo(function AnimatedPlaneTS({
    threeCBs,
    color,
    width,
    height,
    centerX,
    centerY
}) {
    const [planeMesh, setPlaneMesh] = useState(null);

    useEffect(() => {
        if (!threeCBs) return;

        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            side: THREE.DoubleSide
        });

        material.transparent = true;
        material.opacity = 0.6;
        material.shininess = 0;
        const geometry = new THREE.PlaneGeometry(width, height);
        geometry.rotateX(Math.PI / 2);
        geometry.translate(centerX, centerY, 0);

        const mesh = new THREE.Mesh(geometry, material);
        threeCBs.add(mesh);
        setPlaneMesh(mesh);

        return () => {
            threeCBs.remove(mesh);
            geometry.dispose();
            material.dispose();
        };
    }, [threeCBs, color, width, height, centerX, centerY]);

    const oldY = useRef(centerY);

    useEffect(() => {
        if (!planeMesh) {
            oldY.current = centerY;
            return;
        }

        planeMesh.translateY(centerY - oldY.current);
        oldY.current = centerY;
    }, [centerY, planeMesh]);

    return null;
});
