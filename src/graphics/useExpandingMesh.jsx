import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

// returns a callback that expects a mesh argument; this will be added
//
// assumes that the mesh will always have the same material, and the user
// is responsible for disposing it

export default function useExpandingMesh({ startingMesh = null, threeCBs }) {
    const meshRef = useRef(startingMesh);

    const expandCB = useCallback(
        (newMesh) => {
            //setNewMesh(nm);

            if (!newMesh || !threeCBs) return;

            if (!meshRef.current) {
                meshRef.current = newMesh;
                return;
            }

            meshRef.current.geometry = BufferGeometryUtils.mergeBufferGeometries(
                [meshRef.current.geometry, newMesh.geometry].filter((e) => e)
            );
        },
        [meshRef]
    );

    const getMesh = useCallback(() => meshRef.current, [meshRef]);

    const clear = () => {
        if (meshRef.current) {
            threeCBs.remove(meshRef.current);
            meshRef.current.geometry.dispose();
        }
        meshRef.current = null;
    };

    return { expandCB, getMesh, clear };
}
