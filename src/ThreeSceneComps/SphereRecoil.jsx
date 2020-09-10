import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

import { useAtom } from 'jotai';

import * as THREE from 'three';

export default React.memo(function SphereTS({
    threeCBs,
    radius = 2,
    color = '#0A2C3C',
    dragCB = null,
    dragPositionAtom = null,
    visibleAtom
}) {
    const [meshState, setMeshState] = useState();

    const [position, setPosition] = useAtom(dragPositionAtom);

    const [visible] = useAtom(visibleAtom);

    //------------------------------------------------------------------------
    //
    // sets up the mesh
    //

    useEffect(() => {
        if (!threeCBs) {
            setMeshState((s) => s);
            return;
        }

        if (!visible) {
            if (meshState) threeCBs.remove(meshState);
            setMeshState(null);
            return;
        }

        const geometry = new THREE.SphereBufferGeometry(radius, 15, 15);
        const material = new THREE.MeshBasicMaterial({ color });

        const mesh = new THREE.Mesh(geometry, material)
            .translateX(position.x)
            .translateY(position.y);

        threeCBs.add(mesh);
        setMeshState(mesh);

        return () => {
            if (mesh) threeCBs.remove(mesh);
            if (geometry) geometry.dispose();
            if (material) material.dispose();
        };
    }, [visible, color, radius, threeCBs]);

    //------------------------------------------------------------------------
    //
    // updates mesh as position changes
    //

    useLayoutEffect(() => {
        if (!meshState) {
            return;
        }

        meshState.position.x = position.x;
        meshState.position.y = position.y;
    }, [position, meshState]);

    //------------------------------------------------------------------------
    //
    // adds drag controls onto the mesh if dragCB is non-zero
    //

    useEffect(() => {
        if (!threeCBs || !dragPositionAtom || !meshState) return;

        const newDragCB = (event) => {
            if (!event.object.getWorldPosition) {
                setPosition((s) => s);
                return;
            }

            const vec = new THREE.Vector3();
            event.object.getWorldPosition(vec);

            //updatePosition([vec.x, vec.y]);
            setPosition({ x: vec.x, y: vec.y });
        };

        const disposeFunc = threeCBs.addDrag({ mesh: meshState, dragCB: newDragCB });

        return () => {
            if (disposeFunc) disposeFunc();
        };
    }, [meshState, dragPositionAtom, threeCBs]);

    useEffect(() => {
        if (!threeCBs || !dragCB || !meshState) return;

        const disposeFunc = threeCBs.addDrag({ mesh: meshState, dragCB });

        return () => {
            if (disposeFunc) disposeFunc();
        };
    }, [meshState, dragCB, threeCBs]);

    return null;
});
