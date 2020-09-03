import React, { useState, useRef, useEffect, useCallback } from 'react';
import Recoil from 'recoil';
const { RecoilRoot, atom, selector, useRecoilValue, useSetRecoilState } = Recoil;

import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Button } from 'reakit/Button';
import { Portal } from 'reakit/Portal';
import { Provider } from 'reakit/Provider';

import * as system from 'reakit-system-bootstrap';

import './styles.css';

import { ThreeSceneComp } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import SepEquationInput from '../../components/SepEquationInput.jsx';
import ClickablePlaneComp from '../../components/RecoilClickablePlaneComp.jsx';
import InitialPointInput from '../../components/InitialPointInput.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';

import funcParser from '../../utils/funcParser.jsx';

import GridAndOrigin from '../../ThreeSceneComps/GridAndOrigin.jsx';
import Axes2D from '../../ThreeSceneComps/Axes2D.jsx';
import ArrowGrid from '../../ThreeSceneComps/ArrowGridRecoil.jsx';
import DirectionFieldApprox from '../../ThreeSceneComps/DirectionFieldApproxRecoil.jsx';
import Sphere from '../../ThreeSceneComps/SphereRecoil.jsx';

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

// percentage of screen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const fontSize = 1;
const controlBarFontSize = 1;

const initAxesData = {
    radius: 0.01,
    show: true,
    showLabels: true,
    labelStyle
};

const ipAtom = atom({
    key: 'initialPosition',
    default: { x: 2, y: 2 }
});

const xselector = selector({
    key: 'xselector',
    set: ({ get, set }, newX) => set(ipAtom, { x: Number(newX), y: get(ipAtom).y })
});

const yselector = selector({
    key: 'yselector',
    set: ({ get, set }, newY) => set(ipAtom, { y: Number(newY), x: get(ipAtom).x })
});

const initXFuncStr = 'x';
const initYFuncStr = 'cos(y)';

const initFuncStr = 'x*y*sin(x+y)/10';

const funcAtom = atom({
    key: 'function',
    default: { func: funcParser(initFuncStr) }
});

const initState = {
    bounds: { xMin: -20, xMax: 20, yMin: -20, yMax: 20 },
    arrowDensity: 1,
    arrowLength: 0.7,
    approxH: 0.1
};

//------------------------------------------------------------------------

export default function App() {
    return (
        <RecoilRoot>
            <Provider unstable_system={system}>
                <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
                    <ControlBar
                        height={controlBarHeight}
                        fontSize={fontSize * controlBarFontSize}
                        padding='0em'
                    >
                        <SepEquationInput
                            funcAtom={funcAtom}
                            initXFuncStr={initXFuncStr}
                            initYFuncStr={initYFuncStr}
                        />
                        <InitialPointInput
                            ipAtom={ipAtom}
                            xselector={xselector}
                            yselector={yselector}
                        />
                        <Example />
                    </ControlBar>

                    <Main height={100 - controlBarHeight} fontSize={fontSize * controlBarFontSize}>
                        <ThreeSceneComp
                            initCameraData={initCameraData}
                            controlsData={initControlsData}
                        >
                            <GridAndOrigin
                                gridQuadSize={initAxesData.length}
                                gridShow={initState.gridShow}
                            />
                            <Axes2D
                                bounds={initState.bounds}
                                radius={initAxesData.radius}
                                show={initAxesData.show}
                                showLabels={initAxesData.showLabels}
                                labelStyle={labelStyle}
                                color={initColors.axes}
                            />
                            <ArrowGrid
                                funcAtom={funcAtom}
                                bounds={initState.bounds}
                                arrowDensity={initState.arrowDensity}
                                arrowLength={initState.arrowLength}
                                color={initColors.arrows}
                            />
                            <DirectionFieldApprox
                                color={initColors.solution}
                                initialPtAtom={ipAtom}
                                bounds={initState.bounds}
                                funcAtom={funcAtom}
                                approxH={initState.approxH}
                            />
                            <Sphere
                                color={initColors.solution}
                                dragPositionAtom={ipAtom}
                                radius={0.25}
                            />
                            <ClickablePlaneComp clickPositionAtom={ipAtom} />
                        </ThreeSceneComp>
                    </Main>
                </FullScreenBaseComponent>
            </Provider>
        </RecoilRoot>
    );
}

function Example() {
    const dialog = useDialogState();
    return (
        <>
            <DialogDisclosure {...dialog}>
                <span style={{ width: '8em' }}>
                    {!dialog.visible ? 'Show options' : 'Hide options'}
                </span>
            </DialogDisclosure>
            <Dialog
                {...dialog}
                style={{
                    transform: 'none',
                    top: '15%',
                    left: 'auto',
                    right: 20,
                    width: 300,
                    height: 400
                }}
                aria-label='Welcome'
            >
                <Button onClick={dialog.hide}>Close</Button>
            </Dialog>
        </>
    );
}
