import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.js';
import ControlBar from '../../components/ControlBar.js';
import Main from '../../components/Main.js';
import Slider from '../../components/Slider.js';
import TexDisplayComp from '../../components/TexDisplayComp.js';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.js';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use2DAxes from '../../graphics/use2DAxes.js';
import FunctionGraph2DGeom from '../../graphics/FunctionGraph2DGeom.js';

import useDebounce from '../../hooks/useDebounce.js';

import { processNum } from '../../utils/BaseUtils.js';

import { fonts, labelStyle } from './constants.js';

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

const xMin = -100,
    xMax = 100;
const yMin = -100,
    yMax = 100;
const initBounds = { xMin, xMax, yMin, yMax };

const gridBounds = { xMin, xMax, yMin: xMin, yMax: xMax };

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
    mouseButtons: { LEFT: THREE.MOUSE.PAN },
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

const initGridData = {
    show: true,
    originColor: 0x3f405c
};

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 15;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 0.85;

const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.solution),
    side: THREE.FrontSide
});

solutionMaterial.transparent = true;
solutionMaterial.opacity = 0.6;

const solutionCurveRadius = 0.05;

const pointMaterial = solutionMaterial.clone();
pointMaterial.transparent = false;
pointMaterial.opacity = 0.8;

const testFuncMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.testFunc),
    side: THREE.FrontSide
});

//testFuncMaterial.transparent = true;
//testFuncMaterial.opacity = .6;

const initW0Val = 4.8;
const initWVal = 4.83;
const initFVal = 9.5;

const fMin = 0.1;
const fMax = 10;
const w0Min = 0.1;
const w0Max = 10;
const wMin = 0.1;
const wMax = 10;

const step = 0.01;

const resonanceEqTex = '\\ddot{y} + \\omega_0^2 y = f \\cos( \\omega t )';
const initialCondsTex = 'y(0) = 0, \\, \\, \\dot{y}(0) = 0';

const debounceTime = 7;

const boundsDebounceTime = 20;

const initSigDig = 3;

const initPrecision = 4;
const sliderPrecision = 3;

//------------------------------------------------------------------------

export default function App() {
    const [fVal, setFVal] = useState(processNum(initFVal, initPrecision));

    const [wVal, setWVal] = useState(processNum(initWVal, initPrecision));

    const [w0Val, setW0Val] = useState(processNum(initW0Val, initPrecision));

    const [func, setFunc] = useState(null);

    const [bounds, setBounds] = useState(initBounds);

    const [solnStr, setSolnStr] = useState(null);

    const [precision, setPrecision] = useState(initPrecision);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    // expects object with 'str' field
    const num = (x) => Number.parseFloat(x.str);

    const dbFVal = useDebounce(fVal, debounceTime);
    const dbWVal = useDebounce(wVal, debounceTime);
    const dbW0Val = useDebounce(w0Val, debounceTime);

    const dbBounds = useDebounce(bounds, boundsDebounceTime);

    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({
        threeCBs,
        bounds: gridBounds,
        show: initGridData.show,
        originColor: initGridData.originColor,
        originRadius: 0.1
    });

    use2DAxes({
        threeCBs,
        bounds: dbBounds,
        radius: initAxesData.radius,
        color: initAxesData.color,
        show: initAxesData.show,
        showLabels: initAxesData.showLabels,
        labelStyle,
        xLabel: 't'
    });

    //------------------------------------------------------------------------
    //
    // initialize function state

    useEffect(() => {
        const f = num(dbFVal);
        const w = num(dbWVal);
        const w0 = num(dbW0Val);

        if (w != w0) {
            const C = f / (w0 * w0 - w * w);

            setFunc({ func: (t) => C * (Math.cos(w * t) - Math.cos(w0 * t)) });

            setSolnStr(
                `y=${
                    processNum(f / (w0 ** 2 - w ** 2), precision).texStr
                }( \\cos(${w}t) - \\cos(${w0}t))`
            );
        } else {
            setFunc({ func: (t) => (f / (2 * w)) * t * Math.sin(w * t) });

            setSolnStr(
                `y=${processNum(f / (2 * w0), precision).texStr} \\cdot t\\cdot\\sin(${w}t)`
            );
        }
    }, [dbFVal, dbWVal, dbW0Val]);

    //  useEffect( () => {

    //     const f = num(fVal);
    //     const w = num(wVal);
    //     const w0 = num(w0Val);

    //     const C = f/(w0*w0 - w*w);

    //     setFunc({ func: (t) => C*(Math.cos(w*t) - Math.cos(w0*t)) });

    // }, [fVal, wVal, w0Val] );

    //------------------------------------------------------------------------
    //
    // solution display effect

    useEffect(() => {
        if (!threeCBs || !func) return;

        const geom = FunctionGraph2DGeom({
            func: func.func,
            bounds: dbBounds,
            maxSegLength: 20,
            approxH: 0.05,
            radius: 0.05,
            tubularSegments: 1064
        });

        const mesh = new THREE.Mesh(geom, testFuncMaterial);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [threeCBs, dbBounds, func]);

    const css1 = useRef({ padding: '.25em 0' }, []);

    const css2 = useRef(
        {
            margin: 0,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '100%',
            padding: '.5em',
            fontSize: '1.25em',
            flex: 5
        },
        []
    );

    const css3 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1em 2em'
        },
        []
    );

    const css4 = useRef({ whiteSpace: 'nowrap', marginBottom: '1.5em' }, []);

    const css5 = useRef({ whiteSpace: 'nowrap' }, []);

    const css6 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1em 2em'
        },
        []
    );

    const css7 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1em 2em'
        },
        []
    );

    const css8 = useRef(
        {
            padding: '.5em 0',
            fontSize: '1.00em',
            whiteSpace: 'nowrap'
        },
        []
    );

    const css9 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1em 2em'
        },
        []
    );

    return (
        <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
            <ControlBar
                height={controlBarHeight}
                fontSize={initFontSize * controlBarFontSize}
                padding='0em'>
                <div style={css2.current}>
                    <div style={css3.current}>
                        <div style={css4.current}>
                            <TexDisplayComp userCss={css1.current} str={resonanceEqTex} />
                        </div>
                        <div style={css5.current}>
                            <TexDisplayComp userCss={css1.current} str={initialCondsTex} />
                        </div>
                    </div>

                    <div style={css6.current}>
                        <div style={css7.current}>
                            <TexDisplayComp
                                userCss={css1.current}
                                str={`\\frac{f}{\\omega_0^2 - \\omega^2} = ${
                                    processNum(
                                        Number.parseFloat(fVal.str) /
                                            (Number.parseFloat(w0Val.str) *
                                                Number.parseFloat(w0Val.str) -
                                                Number.parseFloat(wVal.str) *
                                                    Number.parseFloat(wVal.str)),
                                        precision
                                    ).texStr
                                }`}
                            />
                        </div>
                        <div style={css8.current}>
                            <TexDisplayComp userCss={css1.current} str={solnStr} />
                        </div>
                    </div>

                    <div style={css9.current}>
                        <Slider
                            userCss={css1.current}
                            value={Number.parseFloat(w0Val.str)}
                            CB={(val) => setW0Val(processNum(Number.parseFloat(val), precision))}
                            label={'w0'}
                            max={w0Max}
                            min={w0Min}
                            step={step}
                            precision={sliderPrecision}
                        />

                        <Slider
                            userCss={css1.current}
                            value={Number.parseFloat(wVal.str)}
                            CB={(val) => setWVal(processNum(Number.parseFloat(val), precision))}
                            label={'w'}
                            min={wMin}
                            max={wMax}
                            step={step}
                            precision={sliderPrecision}
                        />
                        <Slider
                            userCss={css1.current}
                            value={Number.parseFloat(fVal.str)}
                            CB={(val) => setFVal(processNum(Number.parseFloat(val), precision))}
                            label={'f'}
                            min={fMin}
                            max={fMax}
                            step={step}
                            precision={sliderPrecision}
                        />
                    </div>
                </div>
            </ControlBar>

            <Main height={100 - controlBarHeight} fontSize={initFontSize * controlBarFontSize}>
                <ThreeSceneComp
                    ref={threeSceneRef}
                    initCameraData={initCameraData}
                    controlsData={initControlsData}
                    clearColor={initColors.clearColor}
                />
            </Main>
        </FullScreenBaseComponent>
    );
}

//
