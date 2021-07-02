import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import '../../../styles.css';

import { ThreeSceneComp, useThreeCBs } from '../../../components/ThreeScene';
import Grid from '../../../ThreeSceneComps/Grid';
import Axes2D from '../../../ThreeSceneComps/Axes2D.jsx';
import FreeDrawComp from '../../../components/FreeDrawComp.jsx';

import useExpandingMesh from '../../../graphics/useExpandingMesh.jsx';

import { boundsData } from './App_freeDraw_atoms';

//------------------------------------------------------------------------

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = 0.35;
fixedMaterial.transparent = true;

const aspectRatio = window.innerWidth / window.innerHeight;

const fixedCameraData = {
    up: [0, 1, 0],
    near: 0.1,
    far: 100,
    aspectRatio,
    orthographic: true
};

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.PAN },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY_PAN },
    enableRotate: true,
    enablePan: true,
    enabled: false,
    keyPanSpeed: 50,
    zoomSpeed: 2,
    screenSpacePanning: true
};

function App() {
    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const userMesh = useExpandingMesh({ threeCBs });
    const fixedMesh = useExpandingMesh({ threeCBs });

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
        <div className='full-screen-base'>
            <ThreeSceneComp fixedCameraData={fixedCameraData} controlsData={initControlsData}>
                <Axes2D tickDistance={1} boundsAtom={boundsData.atom} />
                <Grid boundsAtom={boundsData.atom} gridShow={true} />
                <FreeDrawComp
                    threeCBs={threeCBs}
                    doneCBs={freeDrawDoneCBs}
                    clearCB={clearCB}
                    material={freeDrawMaterial}
                    fontSize={'1.25em'}
                    transforms={[]}
                />
            </ThreeSceneComp>
        </div>
    );
}

export default App;
