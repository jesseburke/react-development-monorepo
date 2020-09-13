import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Button } from 'reakit/Button';
import { Portal } from 'reakit/Portal';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import { Checkbox } from 'reakit/Checkbox';

import * as system from 'reakit-system-bootstrap';

import * as THREE from 'three';

import classnames from 'classnames';
import styles from './App_simple_sep.module.css';

import './styles.css';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import ClickablePlaneComp from '../../components/RecoilClickablePlaneComp.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import LogisticEquationInput from '../../components/LogisticEquationInput.jsx';
import BoundsInput from '../../components/BoundsInputRecoil.jsx';
import Input from '../../components/Input.jsx';

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

const initBounds = { xMin: -20, xMax: 20, yMin: 0, yMax: 40 };
const boundsAtom = atom(initBounds);

const ipAtom = atom({ x: 2, y: 2 });

const arrowDensityAtom = atom(1);

const arrowThicknessAtom = atom(1);

const arrowLengthAtom = atom(0.75);

const initArrowColor = '#C2374F';

const arrowColorAtom = atom(initArrowColor);

const solutionVisibleAtom = atom(true);

const solutionVisibleSelector = atom(null, (get, set) =>
    set(solutionVisibleAtom, !get(solutionVisibleAtom))
);

const initBVal = 10.0;

const bAtom = atom(initBVal);

const initKVal = 1.0;

const kAtom = atom(initKVal);

const funcAtom = atom((get) => {
    const k = get(kAtom);
    const b = get(bAtom);
    return { func: (x, y) => k * (1 - y / b) };
});

const xLabelAtom = atom('t');
const yLabelAtom = atom('x');

const linePoint1Atom = atom((get) => {
    const xMin = get(boundsAtom).xMin;
    const b = get(bAtom);

    return [xMin, b];
});

const linePoint2Atom = atom((get) => {
    const xMax = get(boundsAtom).xMax;
    const b = get(bAtom);

    return [xMax, b];
});

const lineColor = '#3285ab';

const lineColorAtom = atom(lineColor);

export const lineLabelStyle = {
    color: lineColor,
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

const lineLabelAtom = atom((get) => {
    return {
        pos: [initBounds.xMax - 5, get(bAtom) + 3, 0],
        text: get(yLabelAtom) + '= ' + get(bAtom),
        style: lineLabelStyle
    };
});

const initState = {
    approxH: 0.1
};

const initAxesData = {
    radius: 0.05,
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
                            xLabelAtom={xLabelAtom}
                            yLabelAtom={yLabelAtom}
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
                            arrowThicknessAtom={arrowThicknessAtom}
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
                        <Line
                            point1Atom={linePoint1Atom}
                            point2Atom={linePoint2Atom}
                            labelAtom={lineLabelAtom}
                            colorAtom={lineColorAtom}
                        />
                        <ClickablePlaneComp clickPositionAtom={ipAtom} />
                    </ThreeSceneComp>
                </Main>
            </FullScreenBaseComponent>
        </JProvider>
    );
}

function OptionsModal() {
    const dialog = useDialogState();
    const tab = useTabState();

    useEffect(() => {
        window.dispatchEvent(new Event('resize'));
    });

    return (
        <div zindex={-10}>
            <DialogDisclosure
                style={{ backgroundColor: 'white', color: initColors.controlBar }}
                {...dialog}
            >
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
                    width: 400,
                    height: 250
                }}
                aria-label='Welcome'
            >
                <>
                    <TabList {...tab} aria-label='Option tabs'>
                        <Tab {...tab}>Arrow grid</Tab>
                        <Tab {...tab}>Bounds</Tab>
                        <Tab {...tab}>Variables</Tab>
                    </TabList>
                    <TabPanel {...tab}>
                        <ArrowGridOptions
                            arrowDensityAtom={arrowDensityAtom}
                            arrowLengthAtom={arrowLengthAtom}
                            arrowThicknessAtom={arrowThicknessAtom}
                            arrowColorAtom={arrowColorAtom}
                        />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <BoundsInput
                            boundsAtom={boundsAtom}
                            xLabelAtom={xLabelAtom}
                            yLabelAtom={yLabelAtom}
                        />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <VariablesOptions xLabelAtom={xLabelAtom} yLabelAtom={yLabelAtom} />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
}

// <TabPanel {...tab}>
//                         <SolutionCurveOptions
//                             solutionVisibleAtom={solutionVisibleAtom}
//                             svSelector={solutionVisibleSelector}
//                         />
//                     </TabPanel>

function ArrowGridOptions({
    arrowDensityAtom,
    arrowLengthAtom,
    arrowColorAtom,
    arrowThicknessAtom
}) {
    const [ad, setAd] = useAtom(arrowDensityAtom);
    const [al, setAl] = useAtom(arrowLengthAtom);
    const [at, setAt] = useAtom(arrowThicknessAtom);
    const [ac, setAc] = useAtom(arrowColorAtom);

    const adCb = useCallback((inputStr) => setAd(Number(inputStr)), [setAd]);
    const alCb = useCallback((inputStr) => setAl(Number(inputStr)), [setAl]);
    const atCb = useCallback((inputStr) => setAt(Number(inputStr)), [setAt]);
    const acCb = useCallback((e) => setAc(e.target.value), [setAc]);

    return (
        <div className={classnames(styles['center-flex-column'], styles['med-padding'])}>
            <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                <span className={styles['text-align-center']}>Arrows per unit:</span>
                <span className={styles['med-padding']}>
                    <Input size={4} initValue={ad} onC={adCb} />
                </span>
            </div>

            <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                <span className={styles['text-align-center']}>Relative arrow length:</span>
                <span className={styles['med-padding']}>
                    <Input size={4} initValue={al} onC={alCb} />
                </span>
            </div>

            <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                <span className={styles['text-align-center']}>Arrow thickness:</span>
                <span className={styles['med-padding']}>
                    <Input size={4} initValue={at} onC={atCb} />
                </span>
            </div>

            <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                <span className={styles['text-align-center']}>Color:</span>
                <span className={styles['med-padding']}>
                    <input type='color' name='color' id='color' value={ac} onChange={acCb} />
                </span>
            </div>
        </div>
    );
}

function SolutionCurveOptions({ solutionVisibleAtom, svSelector }) {
    const [checked] = useAtom(solutionVisibleAtom);

    const [, toggle] = useAtom(svSelector);

    return (
        <label>
            <Checkbox checked={checked} onChange={toggle} />
            <span className={styles['med-margin']}>Show solution curve</span>
        </label>
    );
}

function VariablesOptions({ xLabelAtom, yLabelAtom }) {
    const [xLabel, setXLabel] = useAtom(xLabelAtom);
    const [yLabel, setYLabel] = useAtom(yLabelAtom);

    const xCB = useCallback((inputStr) => setXLabel(inputStr), [setXLabel]);
    const yCB = useCallback((inputStr) => setYLabel(inputStr), [setYLabel]);

    return (
        <div className={classnames(styles['center-flex-column'], styles['med-padding'])}>
            <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                <span className={styles['text-align-center']}>Independent variable</span>
                <span className={styles['med-padding']}>
                    <Input size={4} initValue={xLabel} onC={xCB} />
                </span>
            </div>

            <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                <span className={styles['text-align-center']}>Dependent variable:</span>
                <span className={styles['med-padding']}>
                    <Input size={4} initValue={yLabel} onC={yCB} />
                </span>
            </div>
        </div>
    );
}
