import React, { useState, useRef, useEffect } from 'react';

import * as THREE from 'three';

export default React.memo(function SphereTS({
    threeCBs,
    radius = 2,
    color = '#0A2C3C',
    position = [0, 0],
    dragCB = null
}) {
    const [meshState, setMeshState] = useState();

    //------------------------------------------------------------------------
    //
    // sets up the mesh
    //

    useEffect(() => {
        if (!threeCBs) {
            setMeshState((s) => s);
            return;
        }

        const geometry = new THREE.SphereBufferGeometry(radius, 15, 15);
        const material = new THREE.MeshBasicMaterial({ color });

        const mesh = new THREE.Mesh(geometry, material)
            .translateX(position[0])
            .translateY(position[1]);

        threeCBs.add(mesh);
        setMeshState(mesh);

        return () => {
            if (mesh) threeCBs.remove(mesh);
            if (geometry) geometry.dispose();
            if (material) material.dispose();
        };
    }, [color, radius, threeCBs]);

    //------------------------------------------------------------------------
    //
    // updates mesh as position changes
    //

    const oldPos = useRef();

    useEffect(() => {
        if (!threeCBs || !meshState) {
            return;
        }

        if (!oldPos.current) {
            oldPos.current = position;
            return;
        }

        const dx = position[0] - oldPos.current[0];
        const dy = position[1] - oldPos.current[1];

        meshState.translateX(dx);
        meshState.translateY(dy);

        return () => {
            oldPos.current = position;
        };
    }, [position, meshState]);

    //------------------------------------------------------------------------
    //
    // adds drag controls onto the mesh if dragCB is non-zero
    //

    useEffect(() => {
        if (!threeCBs || !dragCB || !meshState) return;

        const disposeFunc = threeCBs.addDrag({ mesh: meshState, dragCB });

        return () => {
            if (disposeFunc) disposeFunc();
        };
    }, [meshState, dragCB, threeCBs]);

    return null;
});
