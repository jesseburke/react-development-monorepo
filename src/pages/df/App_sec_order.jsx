import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import SaveStateComp from '../../components/SaveStateComp.jsx';

import GridAndOrigin from '../../ThreeSceneComps/GridAndOriginRecoil.jsx';
import Axes2D from '../../ThreeSceneComps/Axes2DRecoil.jsx';
import Sphere from '../../ThreeSceneComps/SphereRecoil.jsx';
import FunctionGraph2D from '../../ThreeSceneComps/FunctionGraph2DRecoil.jsx';

import { fonts, labelStyle } from './constants.jsx';

import {
    decode,
    encode,
    atomArray,
    boundsAtom,
    BoundsInput,
    initialPoint1Atom,
    initialPoint2Atom,
    initialPoint1ColorAtom,
    initialPoint2ColorAtom,
    InitialPointsInput,
    CoefficientInput,
    xLabelAtom,
    yLabelAtom,
    solnAtom,
    solutionCurveOptionsAtom,
    SolutionCurveOptionsInput,
    SolutionDisplayComp,
    TitleEquationComp,
    VariablesOptionsInput,
    CaseDisplay
} from './App_sec_order_data.jsx';

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
const frustumSize = 40;

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
const controlBarHeight = 17;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 0.85;

//------------------------------------------------------------------------

export default function App() {
    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
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
                    >
                        <TitleEquationComp />
                        <CoefficientInput />
                        <CaseDisplay />
                        <InitialPointsInput />
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
                        <Sphere
                            color={initialPoint1ColorAtom}
                            dragPositionAtom={initialPoint1Atom}
                            radius={0.25}
                        />
                        <Sphere
                            color={initialPoint2ColorAtom}
                            dragPositionAtom={initialPoint2Atom}
                            radius={0.25}
                        />
                        <FunctionGraph2D
                            funcAtom={solnAtom}
                            boundsAtom={boundsAtom}
                            curveOptionsAtom={solutionCurveOptionsAtom}
                        />
                    </ThreeSceneComp>
                    <SaveStateComp decode={decode} encode={encode} atomArray={atomArray} />
                </Main>
            </FullScreenBaseComponent>
        </JProvider>
    );
}

const OptionsModal = React.memo(({}) => {
    const dialog = useDialogState();
    const tab = useTabState();

    const cssRef = useRef({ backgroundColor: 'white', color: initColors.controlBar, width: '8em' });

    const cssRef1 = useRef({
        transform: 'none',
        top: '15%',
        left: 'auto',
        right: 20,
        width: 400,
        height: 250
    });

    useEffect(() => {
        window.dispatchEvent(new Event('resize'));
    });

    return (
        <div zindex={-10}>
            <DialogDisclosure style={cssRef.current} {...dialog}>
                <span>{!dialog.visible ? 'Show options' : 'Hide options'}</span>
            </DialogDisclosure>
            <Dialog {...dialog} style={cssRef1.current} aria-label='Welcome'>
                <>
                    <TabList {...tab} aria-label='Option tabs'>
                        <Tab {...tab}>Bounds</Tab>
                        <Tab {...tab}>Solution Curve</Tab>
                        <Tab {...tab}>Variables</Tab>
                    </TabList>
                    <TabPanel {...tab}>
                        <BoundsInput />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <SolutionCurveOptionsInput />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <VariablesOptionsInput />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
});
