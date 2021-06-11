import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import './styles.css';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.js';
import FreeDrawComp from '../../components/FreeDrawComp.jsx';

import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.jsx';
import use2DAxes from '../../graphics/use2DAxes.jsx';
import useExpandingMesh from '../../graphics/useExpandingMesh.jsx';

import { fonts, initAxesData, initGridAndOriginData, initOrthographicData } from './constants.jsx';

//------------------------------------------------------------------------

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = 0.35;
fixedMaterial.transparent = true;

export default function App() {
    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    //------------------------------------------------------------------------
    //
    // starting effects

    const userMesh = useExpandingMesh({ threeCBs });
    const fixedMesh = useExpandingMesh({ threeCBs });

    useGridAndOrigin({ threeCBs, gridData: initGridAndOriginData });
    use2DAxes({ threeCBs, axesData: initAxesData });

    //------------------------------------------------------------------------

    const clearCB = useCallback(() => {
        if (!threeCBs) return;

        if (userMesh) {
            userMesh.clear();
        }

        if (fixedMesh) {
            fixedMesh.clear();
        }
    }, [threeCBs, userMesh, fixedMesh]);

    const freeDrawDoneCBs = [
        userMesh.expandCB,
        useCallback(
            (mesh) => {
                if (!mesh) return;
                mesh.material = fixedMaterial;
                fixedMesh.expandCB(mesh);
            },
            [fixedMesh]
        )
    ];

    return (
        <FullScreenBaseComponent fonts={fonts}>
            <ThreeSceneComp />

            <FreeDrawComp
                threeCBs={threeCBs}
                doneCBs={freeDrawDoneCBs}
                clearCB={clearCB}
                material={freeDrawMaterial}
                fontSize={'1.25em'}
                transforms={[]}
            />
        </FullScreenBaseComponent>
    );
}
