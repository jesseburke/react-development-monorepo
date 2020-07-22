import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import gsap from 'gsap';

import { Helmet } from 'react-helmet';

import styles from './App.module.css';

import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import { FunctionAndBoundsInputXT as FunctionAndBoundsInput } from '../../components/FunctionAndBoundsInput.jsx';
import Slider from '../../components/Slider.jsx';

import { ThreeSceneComp } from '../../components/ThreeScene.jsx';
import CanvasComp from '../../components/CanvasComp.jsx';

import GridAndOriginTS from '../../ThreeSceneComps/GridAndOrigin.jsx';
import Axes3DTS from '../../ThreeSceneComps/Axes3D.jsx';
import FunctionGraph3DTS from '../../ThreeSceneComps/FunctionGraph3D.jsx';
import AnimatedPlaneTS from '../../ThreeSceneComps/AnimatedPlane.jsx';

import Axes2DC from '../../CanvasComps/Axes2D.jsx';
import FunctionGraph2D from '../../CanvasComps/FunctionGraph2D.jsx';

import { funcParserXT as funcParser } from '../../utils/funcParser.jsx';

//------------------------------------------------------------------------
//
// initial data
//

const initColors = {
    arrows: '#C2374F',
    plane: '#82BFCD',
    axes: '#181A2A', //0A2C3C',
    controlBar: '#181A2A', //0A2C3C',
    clearColor: '#f0f0f0',
    funcGraph: '#E53935'
};

const initFuncStr = '4*e^(-(x-2*t)^2)+sin(x+t)-cos(x-t)'; //'2*e^(-(x-t)^2)+sin(x+t)-cos(x-t)';//'2*e^(-(x-t)^2)';

// while it's assumed xMin and tMin are zero; it's handy to keep them around to not break things
const initBounds = { xMin: 0, xMax: 10, tMin: 0, tMax: 10, zMin: -5, zMax: 5 };

const xLength = initBounds.xMax;
const tLength = initBounds.tMax;

const initCameraData = {
    position: [(15.7 / 20) * xLength, -(13.1 / 20) * tLength, 9.79], //[40, 40, 40],
    up: [0, 0, 1]
};

const initState = {
    bounds: initBounds,
    funcStr: initFuncStr,
    func: funcParser(initFuncStr),
    gridShow: true,
    cameraData: Object.assign({}, initCameraData)
};

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.ROTATE, TWO: THREE.DOLLY_PAN, THREE: THREE.MOUSE.PAN },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false,
    target: new THREE.Vector3(
        (initBounds.xMax - initBounds.xMin) * (10.15 / 20),
        (initBounds.tMax - initBounds.tMin) * (4.39 / 20),
        0
    )
};

const fonts = "'Helvetica', 'Hind', sans-serif";

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 15;
const mainHeight = 85;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const percControlBar = 1.25;
const percDrawer = 0.85;

const labelStyle = {
    color: initColors.controlBar,
    margin: '0em',
    padding: '.15em',
    fontSize: '1.25em'
};

const axesData = { show: true, showLabels: true, length: 10, radius: 0.05 };

const overhang = 2;
const canvasXOverhang = 1;

// what percentage of the horizontal window the threeScene fills
const initThreeWidth = 50;

// in secs
const animTime = 12;

//------------------------------------------------------------------------

export default function App() {
    const [state, setState] = useState(Object.assign({}, initState));

    const [bounds, setBounds] = useState(initState.bounds);

    const [t0, setT0] = useState(0);

    const [paused, setPaused] = useState(true);

    const [timeline, setTimeline] = useState(null);

    //------------------------------------------------------------------------
    //
    // init effects

    const gridCenter = useRef([axesData.length - overhang, axesData.length - overhang]);

    const axesBounds = useRef({
        xMin: -overhang,
        xMax: bounds.xMax + overhang,
        yMin: -overhang,
        yMax: bounds.tMax + overhang,
        zMin: bounds.zMin,
        zMax: bounds.zMax
    });

    useEffect(() => {
        axesBounds.current = {
            xMin: -overhang,
            xMax: bounds.xMax + overhang,
            yMin: -overhang,
            yMax: bounds.tMax + overhang,
            zMin: bounds.zMin,
            zMax: bounds.zMax
        };
    }, [bounds]);

    //------------------------------------------------------------------------
    //
    // animation

    // when pause changes, change the timeline;
    // creates a newtimeline each time paused changes;
    // this fixed a bug with pausing and restarting

    useEffect(() => {
        if (paused) {
            if (timeline) timeline.pause();
            setTimeline(null);
            return;
        }

        const repeatCB = () => {
            setT0(0);
        };

        const newTl = animFactory({
            startTime: t0 / bounds.tMax,
            duration: animTime,
            repeatCB,
            updateCB: (t) => setT0(t * bounds.tMax)
        });
        setTimeline(newTl);
    }, [paused, bounds.tMax]);

    const twoFunc = useCallback((x) => state.func(x, t0), [t0, state.func]);

    const boundMemo = React.useMemo(
        () => ({ ...state.bounds, xMin: -canvasXOverhang + state.bounds.xMin }),
        [state.bounds]
    );

    //------------------------------------------------------------------------
    //
    // callbacks

    const funcAndBoundsInputCB = useCallback((newBounds, newFuncStr) => {
        setState(({ bounds, func, funcStr, ...rest }) => ({
            funcStr: newFuncStr,
            func: funcParser(newFuncStr),
            bounds: newBounds,
            ...rest
        }));
    }, []);

    const sliderCB = useCallback((newT0Str) => setT0(Number(newT0Str)), []);

    const pauseCB = useCallback(() => setPaused((p) => !p), []);

    return (
        <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
            <Helmet>
                <title>Vibrating string</title>
                <meta name='viewport' content='width=device-width, user-scalable=no' />
            </Helmet>

            <ControlBar height={controlBarHeight} fontSize={initFontSize * percControlBar}>
                <FunctionAndBoundsInput
                    onChangeFunc={funcAndBoundsInputCB}
                    initFuncStr={state.funcStr}
                    initBounds={bounds}
                    leftSideOfEquation='s(x,t) ='
                />
                <div className={styles.timeContainer}>
                    <Slider value={t0} CB={sliderCB} label={'t0'} max={bounds.tMax} min={0} />
                    <span onClick={pauseCB} className={styles.playPauseButton}>
                        {paused ? '\u{25B6}' : '\u{23F8}'}
                    </span>
                </div>
            </ControlBar>

            <Main height={mainHeight} fontSize={initFontSize * percDrawer}>
                <ThreeSceneComp
                    initCameraData={initCameraData}
                    controlsData={initControlsData}
                    width={initThreeWidth.toString() + '%'}
                >
                    <GridAndOriginTS
                        gridQuadSize={axesData.length}
                        originRadius={0}
                        center={gridCenter.current}
                        key='grid'
                    />
                    <Axes3DTS
                        bounds={axesBounds.current}
                        labelStyle={labelStyle}
                        yLabel='t'
                        color={initColors.axes}
                        key='axes'
                    />
                    <FunctionGraph3DTS
                        func={state.func}
                        bounds={state.bounds}
                        color={initColors.testFunc}
                        key='func'
                    />
                    <AnimatedPlaneTS
                        color={initColors.plane}
                        width={bounds.xMax + overhang}
                        height={bounds.zMax - bounds.zMin}
                        centerX={bounds.xMax / 2}
                        centerY={t0}
                    />
                </ThreeSceneComp>
                <CanvasComp t0={t0}>
                    <Axes2DC
                        bounds={axesBounds.current}
                        lineWidth={5}
                        color={initColors.controlBar}
                        yLabel='z'
                    />
                    <FunctionGraph2D func={twoFunc} bounds={boundMemo} />
                </CanvasComp>
            </Main>
        </FullScreenBaseComponent>
    );
}

const animFactory = ({
    startTime,
    duration,
    updateCB,
    repeatCB = () => null,
    repeatDelay = 0.75
}) => {
    let time = { t: 0 };

    const tl = gsap.timeline();

    tl.to(time, {
        t: 1,
        ease: 'none',
        duration,
        paused: false,
        repeat: -1,
        onUpdate: () => updateCB(time.t)
    });

    tl.pause();
    //tl.seek(startTime*duration);
    //tl.resume();

    tl.play(startTime * duration);

    return tl;
};
