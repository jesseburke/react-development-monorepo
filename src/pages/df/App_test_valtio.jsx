import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import './styles.css';

import { useThreeCBs, ThreeSceneComp } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import ClickablePlaneComp from '../../components/RecoilClickablePlaneComp.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';

import Grid from '../../ThreeSceneComps/Grid.jsx';
import Axes2D from '../../ThreeSceneComps/Axes2DRecoil.jsx';
import ArrowGrid from '../../ThreeSceneComps/ArrowGridValtio.jsx';
import DirectionFieldApprox from '../../ThreeSceneComps/DirectionFieldApproxValtio.jsx';

import { fonts, labelStyle } from './constants.jsx';

import {
    arrowGridDataAtom,
    boundsAtom,
    initialPointAtom,
    InitialPointInput,
    funcAtom,
    EquationInput,
    labelAtom,
    solutionCurveDataAtom,
    axesDataAtom,
    DataComp,
    DataCompV,
    initialPointProxy,
    InitialPointInputV,
    equationProxy,
    EquationInputV,
    funcProxy
} from './App_test_valtio_data.jsx';

const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    firstPt: '#C2374F',
    secPt: '#C2374F',
    testFunc: '#E16962', //#DBBBB0',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0'
};

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.ROTATE },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

const aspectRatio = window.innerWidth / window.innerHeight;
//const frustumSize = 20;
const frustumSize = 3.8;

const initCameraData = {
    position: [0, 0, 1],
    up: [0, 0, 1],
    //fov: 75,
    near: -100,
    far: 100,
    rotation: { order: 'XYZ' },
    orthographic: {
        left: (frustumSize * aspectRatio) / -2,
        right: (frustumSize * aspectRatio) / 2,
        top: frustumSize / 2,
        bottom: frustumSize / -2
    }
};

// percentage of screen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const fontSize = 1;
const controlBarFontSize = 1;

//------------------------------------------------------------------------

export default function App() {
    const threeSceneRef = useRef();

    return (
        <JProvider>
            <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
                <ControlBar
                    height={controlBarHeight}
                    fontSize={fontSize * controlBarFontSize}
                    padding='0em'
                >
                    <div className='center-flex-row'>
                        <EquationInputV />
                    </div>
                    <InitialPointInputV />
                </ControlBar>

                <Main height={100 - controlBarHeight} fontSize={fontSize * controlBarFontSize}>
                    <ThreeSceneComp
                        initCameraData={initCameraData}
                        controlsData={initControlsData}
                        ref={(elt) => (threeSceneRef.current = elt)}
                        showPhotoButton={false}
                    >
                        <DirectionFieldApprox
                            initialPointProxy={initialPointProxy}
                            boundsAtom={boundsAtom}
                            funcProxy={funcProxy}
                            curveDataAtom={solutionCurveDataAtom}
                        />
                        <Grid boundsAtom={boundsAtom} gridShow={true} />
                        <Axes2D
                            tickLabelDistance={1}
                            boundsAtom={boundsAtom}
                            axesDataAtom={axesDataAtom}
                            labelAtom={labelAtom}
                        />
                        <ArrowGrid
                            funcProxy={funcProxy}
                            boundsAtom={boundsAtom}
                            arrowGridDataAtom={arrowGridDataAtom}
                        />
                        <ClickablePlaneComp clickPositionAtom={initialPointAtom} />
                    </ThreeSceneComp>
                    <DataCompV />
                </Main>
            </FullScreenBaseComponent>
        </JProvider>
    );
}
