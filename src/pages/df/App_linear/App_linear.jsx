import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import { ThreeSceneComp, useThreeCBs } from '../../../components/ThreeScene.jsx';
import ControlBar from '../../../components/ControlBar.jsx';
import Main from '../../../components/Main.jsx';
import ClickablePlaneComp from '../../../components/RecoilClickablePlaneComp.jsx';
import FullScreenBaseComponent from '../../../components/FullScreenBaseComponent.jsx';
import SaveStateComp from '../../../components/SaveStateComp.jsx';

import GridAndOrigin from '../../../ThreeSceneComps/GridAndOriginRecoil.jsx';
import Axes2D from '../../../ThreeSceneComps/Axes2DRecoil.jsx';
import ArrowGrid from '../../../ThreeSceneComps/ArrowGridRecoil.jsx';
import DirectionFieldApprox from '../../../ThreeSceneComps/DirectionFieldApproxRecoil.jsx';

import { fonts, labelStyle } from '../constants.jsx';

import {
    decode,
    encode,
    atomArray,
    arrowGridOptionsAtom,
    ArrowGridOptionsInput,
    boundsAtom,
    BoundsInput,
    initialPointAtom,
    InitialPointInput,
    LinearEquationInput,
    funcAtom,
    xLabelAtom,
    yLabelAtom,
    solutionCurveOptionsAtom,
    SolutionCurveOptionsInput
} from './App_linear_data.jsx';

//------------------------------------------------------------------------
//
// initial data
//

const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    firstPt: '#C2374F',
    secPt: '#C2374F',
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

const initAxesData = {
    radius: 0.01,
    color: initColors.axes,
    tickDistance: 1,
    tickRadius: 3.5,
    show: true,
    showLabels: true,
    labelStyle
};

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 1;

//------------------------------------------------------------------------

export default function App() {
    const threeSceneRef = useRef(null);
    const threeCBs = useThreeCBs(threeSceneRef);

    // following is hacky way to get three displayed on render
    useEffect(() => {
        if (!threeCBs || !threeSceneRef) return;

        window.dispatchEvent(new Event('resize'));
    }, [threeCBs, threeSceneRef]);

    return (
        <JProvider>
            <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
                <Provider unstable_system={system}>
                    <ControlBar
                        height={controlBarHeight}
                        fontSize={initFontSize * controlBarFontSize}
                        padding='.5em'
                    >
                        <LinearEquationInput />
                        <InitialPointInput />
                        <OptionsModal />
                    </ControlBar>
                </Provider>

                <Main height={100 - controlBarHeight} fontSize={initFontSize * controlBarFontSize}>
                    <ThreeSceneComp
                        ref={threeSceneRef}
                        initCameraData={initCameraData}
                        controlsData={initControlsData}
                        clearColor={initColors.clearColor}
                    >
                        <GridAndOrigin
                            boundsAtom={boundsAtom}
                            gridQuadSize={initAxesData.length}
                            gridShow={true}
                        />
                        <Axes2D
                            boundsAtom={boundsAtom}
                            radius={initAxesData.radius}
                            show={initAxesData.show}
                            showLabels={initAxesData.showLabels}
                            labelStyle={labelStyle}
                            color={initColors.axes}
                            xLabelAtom={xLabelAtom}
                            yLabelAtom={yLabelAtom}
                        />
                        <ArrowGrid
                            funcAtom={funcAtom}
                            boundsAtom={boundsAtom}
                            arrowGridOptionsAtom={arrowGridOptionsAtom}
                        />
                        <DirectionFieldApprox
                            initialPointAtom={initialPointAtom}
                            boundsAtom={boundsAtom}
                            funcAtom={funcAtom}
                            solutionCurveOptionsAtom={solutionCurveOptionsAtom}
                        />
                        <ClickablePlaneComp clickPositionAtom={initialPointAtom} />
                    </ThreeSceneComp>
                    <SaveStateComp decode={decode} encode={encode} atomArray={atomArray} />
                </Main>
            </FullScreenBaseComponent>
        </JProvider>
    );
}

const OptionsModal = React.memo(() => {
    const dialog = useDialogState();
    const tab = useTabState();

    useEffect(() => {
        window.dispatchEvent(new Event('resize'));
    });

    const cssRef = useRef({
        transform: 'none',
        top: '15%',
        left: 'auto',
        right: 20,
        width: 400,
        height: 250
    });

    const cssRef1 = useRef({ width: '8em' });

    const cssRef2 = useRef({ backgroundColor: 'white', color: initColors.controlBar });

    return (
        <div zindex={-10}>
            <DialogDisclosure style={cssRef2.current} {...dialog}>
                <span style={cssRef1.current}>
                    {!dialog.visible ? 'Show options' : 'Hide options'}
                </span>
            </DialogDisclosure>
            <Dialog {...dialog} style={cssRef.current} aria-label='Welcome'>
                <>
                    <TabList {...tab} aria-label='Option tabs'>
                        <Tab {...tab}>Arrow grid</Tab>
                        <Tab {...tab}>Bounds</Tab>
                        <Tab {...tab}>Solution curve</Tab>
                    </TabList>
                    <TabPanel {...tab}>
                        <ArrowGridOptionsInput />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <BoundsInput />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <SolutionCurveOptionsInput />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
});
