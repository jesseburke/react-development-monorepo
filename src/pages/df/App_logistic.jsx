import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import { Checkbox } from 'reakit/Checkbox';

import * as system from 'reakit-system-bootstrap';

import queryString from 'query-string-esm';

import * as THREE from 'three';

import classnames from 'classnames';
import styles from './App_simple_sep.module.css';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import LogisticEquationInput from '../../components/LogisticEquationInput.jsx';

import GridAndOrigin from '../../ThreeSceneComps/GridAndOrigin.jsx';
import Axes2D from '../../ThreeSceneComps/Axes2DRecoil.jsx';
import ArrowGrid from '../../ThreeSceneComps/ArrowGridRecoil.jsx';
import DirectionFieldApprox from '../../ThreeSceneComps/DirectionFieldApproxRecoil.jsx';
import Line from '../../ThreeSceneComps/LineRecoil.jsx';
import ClickablePlane from '../../ThreeSceneComps/ClickablePlane.jsx';

import { fonts, labelStyle } from './constants.jsx';

import {
    decode,
    encode,
    atomArray,
    arrowGridOptionsAtom,
    ArrowGridOptionsInput,
    boundsAtom,
    BoundsInput,
    lineLabelAtom,
    bAtom,
    kAtom,
    initialPointAtom,
    funcAtom,
    xLabelAtom,
    yLabelAtom,
    linePoint1Atom,
    linePoint2Atom,
    lineColorAtom,
    solutionCurveOptionsAtom,
    SolutionCurveOptionsInput,
    VariablesOptionsInput
} from './App_logistic_data.jsx';

//------------------------------------------------------------------------
//
// initial data
//

const initColors = {
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0'
};

const aspectRatio = window.innerWidth / window.innerHeight;
const frustumSize = 45;

const yCameraTarget = 20;

const initCameraData = {
    position: [0, yCameraTarget, 1],
    up: [0, yCameraTarget, 1],
    fov: 75,
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
    screenSpaceSpanning: false,
    target: new THREE.Vector3(0, yCameraTarget, 0)
};

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 1;

const initAxesData = {
    radius: 0.05,
    color: initColors.axes,
    show: true,
    showLabels: true,
    labelStyle
};

export default function App() {
    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    // this is a hack to get three scene drawn initially
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
                        <LogisticEquationInput
                            bAtom={bAtom}
                            kAtom={kAtom}
                            xLabelAtom={xLabelAtom}
                            yLabelAtom={yLabelAtom}
                        />
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
                            color={initColors.axes}
                            xLabelAtom={xLabelAtom}
                            yLabelAtom={yLabelAtom}
                        />
                        <ArrowGrid
                            funcAtom={funcAtom}
                            boundsAtom={boundsAtom}
                            arrowGridDisplayAtom={arrowGridOptionsAtom}
                        />
                        <DirectionFieldApprox
                            initialPointAtom={initialPointAtom}
                            boundsAtom={boundsAtom}
                            funcAtom={funcAtom}
                            solutionCurveOptionsAtom={solutionCurveOptionsAtom}
                        />
                        <Line
                            point1Atom={linePoint1Atom}
                            point2Atom={linePoint2Atom}
                            labelAtom={lineLabelAtom}
                            colorAtom={lineColorAtom}
                        />
                        <ClickablePlane clickPointAtom={initialPointAtom} />
                    </ThreeSceneComp>
                    <SaveStateComp encode={encode} atomArray={atomArray} />
                </Main>
            </FullScreenBaseComponent>
        </JProvider>
    );
}

const identity = (x) => x;

function strArrayToArray(strArray, f = identity) {
    // e.g., '2,4,-32.13' -> [2, 4, -32.13]
    // f is a function applied to the string representing each array element

    return strArray.split(',').map((x) => f(x));
}

function SaveStateComp({ encode, atomArray, children }) {
    const atomValueArray = atomArray.map((a) => useAtom(a)[0]);
    const atomSetterArray = atomArray.map((a) => useAtom(a)[1]);

    useEffect(() => {
        const qs = window.location.search;

        if (qs.length === 0) {
            //setState((s) => s);
            return;
        }

        let { state: newStateArray } = queryString.parse(qs.slice(1));

        newStateArray = decode(strArrayToArray(newStateArray));

        for (let i = 0; i < newStateArray.length; i++) {
            atomSetterArray[i](newStateArray[i]);
        }
    }, []);

    const cb = useCallback(() => {
        const stateStr = encode(atomValueArray);

        window.history.replaceState(
            null,
            null,
            '?' +
                queryString.stringify(
                    { state: stateStr },
                    {
                        decode: true,
                        arrayFormat: 'comma'
                    }
                )
        );
    }, [encode, atomValueArray]);

    const cssRef = useRef({
        position: 'absolute',
        top: '85%',
        left: '5%',
        padding: '1%',
        border: '1px',
        borderStyle: 'solid',
        borderRadius: '50%',
        fontSize: initFontSize.toString() + 'em',
        // next line stops cursor from changing to text selection on hover
        cursor: 'pointer',
        backgroundColor: initColors.clearColor
    });

    const cssRef2 = useRef({ padding: '.15em', fontSize: '2rem' });

    const component = children ? (
        React.cloneElement(children[0], { onClick: cb })
    ) : (
        <div style={cssRef.current} onClick={cb}>
            <span style={cssRef2.current}>{'\u{1F4BE}'}</span>
        </div>
    );

    return component;
}

function OptionsModal() {
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
                        <Tab {...tab}>Arrow grid</Tab>
                        <Tab {...tab}>Bounds</Tab>
                        <Tab {...tab}>Solution Curve</Tab>
                        <Tab {...tab}>Variables</Tab>
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
                    <TabPanel {...tab}>
                        <VariablesOptionsInput />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
}
