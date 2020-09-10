import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, Provider } from 'jotai';
import { useAtom } from 'jotai';

import * as THREE from 'three';

import './styles.css';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import ClickablePlaneComp from '../../components/RecoilClickablePlaneComp.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import LogisticEquationInput from '../../components/LogisticEquationInput.jsx';

import GridAndOrigin from '../../ThreeSceneComps/GridAndOrigin.jsx';
import Axes2D from '../../ThreeSceneComps/Axes2DRecoil.jsx';
import ArrowGrid from '../../ThreeSceneComps/ArrowGridRecoil.jsx';
import DirectionFieldApprox from '../../ThreeSceneComps/DirectionFieldApproxRecoil.jsx';
import Sphere from '../../ThreeSceneComps/SphereRecoil.jsx';
import Line from '../../ThreeSceneComps/LineRecoil.jsx';

import { fonts, labelStyle } from './constants.jsx';

//------------------------------------------------------------------------
//
// initial data
//

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

const aspectRatio = window.innerWidth / window.innerHeight;
const frustumSize = 20;

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

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.ROTATE },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 1;

const boundsAtom = atom({ xMin: -20, xMax: 20, yMin: 0, yMax: 40 });

const ipAtom = atom({ x: 2, y: 2 });

const arrowDensityAtom = atom(1);

const arrowLengthAtom = atom(0.75);

const arrowColorAtom = atom('#C2374F');

const solutionVisibleAtom = atom(true);

const initBVal = 1.0;

const bAtom = atom(initBVal);

const initKVal = 1.0;

const kAtom = atom(initKVal);

const funcAtom = atom((get) => {
    const k = get(kAtom);
    const b = get(bAtom);
    return { func: (x, y) => k * (1 - y / b) };
});

const point1Atom = atom((get) => {
    const xMin = get(boundsAtom).xMin;
    const b = get(bAtom);

    return [xMin, b];
});

const point2Atom = atom((get) => {
    const xMax = get(boundsAtom).xMax;
    const b = get(bAtom);

    return [xMax, b];
});

const initState = {
    approxH: 0.1
};

const initAxesData = {
    radius: 0.01,
    color: initColors.axes,
    show: true,
    showLabels: true,
    labelStyle
};

//------------------------------------------------------------------------

export default function App() {
    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    useEffect(() => {
        if (!threeCBs || !threeSceneRef) return;
        window.dispatchEvent(new Event('resize'));
    }, [threeCBs, threeSceneRef]);

    return (
        <Provider>
            <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
                <ControlBar
                    height={controlBarHeight}
                    fontSize={initFontSize * controlBarFontSize}
                    padding='.5em'
                >
                    <LogisticEquationInput bAtom={bAtom} kAtom={kAtom} />
                </ControlBar>

                <Main height={100 - controlBarHeight} fontSize={initFontSize * controlBarFontSize}>
                    <ThreeSceneComp
                        ref={threeSceneRef}
                        initCameraData={initCameraData}
                        controlsData={initControlsData}
                        clearColor={initColors.clearColor}
                    >
                        <GridAndOrigin
                            gridQuadSize={initAxesData.length}
                            gridShow={true}
                            center={[0, 20]}
                            originRadius={0.15}
                        />
                        <Axes2D
                            boundsAtom={boundsAtom}
                            radius={initAxesData.radius}
                            show={initAxesData.show}
                            showLabels={initAxesData.showLabels}
                            labelStyle={labelStyle}
                            yLabel='x'
                            xLabel='t'
                            color={initColors.axes}
                        />
                        <Sphere
                            color={initColors.solution}
                            dragPositionAtom={ipAtom}
                            radius={0.25}
                            visibleAtom={solutionVisibleAtom}
                        />
                        <ArrowGrid
                            funcAtom={funcAtom}
                            boundsAtom={boundsAtom}
                            arrowDensityAtom={arrowDensityAtom}
                            arrowLengthAtom={arrowLengthAtom}
                            arrowColorAtom={arrowColorAtom}
                        />
                        <DirectionFieldApprox
                            color={initColors.solution}
                            initialPtAtom={ipAtom}
                            visibleAtom={solutionVisibleAtom}
                            boundsAtom={boundsAtom}
                            funcAtom={funcAtom}
                            approxH={initState.approxH}
                        />
                        <Line point1Atom={point1Atom} point2Atom={point2Atom} />
                        <ClickablePlaneComp clickPositionAtom={ipAtom} />
                    </ThreeSceneComp>
                </Main>
            </FullScreenBaseComponent>
        </Provider>
    );
}
