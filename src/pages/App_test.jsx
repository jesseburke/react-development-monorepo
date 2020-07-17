import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import gsap from 'gsap';

import { Helmet } from 'react-helmet';

import ControlBar from '../components/ControlBar.jsx';
import Main from '../components/Main.jsx';
import FullScreenBaseComponent from '../components/FullScreenBaseComponent.jsx';
import { ThreeSceneComp } from '../components/ThreeScene.jsx';
import { FunctionAndBoundsInputXT as FunctionAndBoundsInput } from '../components/FunctionAndBoundsInput.jsx';

import GridAndOriginTS from '../ThreeSceneComps/GridAndOriginTS.jsx';
import Axes3DTS from '../ThreeSceneComps/Axes3DTS.jsx';
import FunctionGraph3DTS from '../ThreeSceneComps/FunctionGraph3DTS.jsx';

import { funcParserXT as funcParser } from '../utils/funcParser.jsx';

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

//------------------------------------------------------------------------

export default function App() {
    const [state, setState] = useState(Object.assign({}, initState));

    const [bounds, setBounds] = useState(initState.bounds);

    const threeSceneRef = useRef(null);

    //const threeCBs = useThreeCBs(threeSceneRef);

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
    // callbacks

    const funcAndBoundsInputCB = useCallback((newBounds, newFuncStr) => {
        setState(({ bounds, func, funcStr, ...rest }) => ({
            funcStr: newFuncStr,
            func: funcParser(newFuncStr),
            bounds: newBounds,
            ...rest
        }));
    }, []);

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
            </ControlBar>

            <Main height={100 - controlBarHeight} fontSize={initFontSize * percDrawer}>
                <ThreeSceneComp
                    ref={threeSceneRef}
                    initCameraData={initCameraData}
                    controlsData={initControlsData}
                    width={initThreeWidth.toString() + '%'}
                >
                    <GridAndOriginTS
                        gridQuadSize={axesData.length}
                        gridShow={initState.gridShow}
                        originRadius={0}
                        center={gridCenter.current}
                    />

                    <Axes3DTS
                        bounds={axesBounds.current}
                        radius={axesData.radius}
                        show={axesData.show}
                        showLabels={axesData.showLabels}
                        labelStyle={labelStyle}
                        yLabel='t'
                        color={initColors.axes}
                    />
                    <FunctionGraph3DTS
                        func={state.func}
                        bounds={bounds}
                        color={initColors.funcGraph}
                    />
                </ThreeSceneComp>
            </Main>
        </FullScreenBaseComponent>
    );
}
