import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import * as THREE from 'three';

import { FullScreenBaseComponent } from '@jesseburke/basic-react-components';
import { Button } from '@jesseburke/basic-react-components';

import { ThreeSceneComp, useThreeCBs } from '../components/ThreeScene.jsx';
import ControlBar from '../components/ControlBar.jsx';
import Main from '../components/Main.jsx';
import FunctionInput from '../components/FunctionInput.jsx';
import funcParser from '../utils/funcParser.jsx';
import ResetCameraButton from '../components/ResetCameraButton.jsx';
import ClickablePlaneComp from '../components/ClickablePlaneComp.jsx';
import Input from '../components/Input.jsx';
import ArrowGridOptions from '../components/ArrowGridOptions.jsx';

import useGridAndOrigin from '../graphics/useGridAndOrigin.jsx';
import use2DAxes from '../graphics/use2DAxes.jsx';
import use3DAxes from '../graphics/use3DAxes.jsx';
import FunctionGraph from '../graphics/FunctionGraph.jsx';
import ArrowGrid from '../graphics/ArrowGrid.jsx';
import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.jsx';

import ArrowGeometry from '../graphics/ArrowGeometry.jsx';

import {
    initColors,
    initControlsData,
    secControlsData,
    initFuncStr,
    initXFuncStr,
    fonts,
    initYFuncStr
} from './constants.jsx';

import katex from 'katex';
import 'katex/dist/katex.min.css';

//------------------------------------------------------------------------
//
// initial data
//

const bounds = { xMin: -100, xMax: 100, yMin: 0, yMax: 260 };
const { xMin, xMax, yMin, yMax } = bounds;

export const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

const initArrowGridData = {
    gridSqSize: 5,
    color: initColors.arrows,
    arrowLength: 0.5,
    bounds
};

export const cameraConst = 1.1;

export const initCameraData = {
    position: [0, 0, 100],
    up: [0, 1, 0],
    //fov: 75,
    near: -1,
    far: 5000,
    rotation: { order: 'XYZ' },
    orthographic: {
        left: cameraConst * xMin,
        right: cameraConst * xMax,
        top: cameraConst * yMax,
        bottom: cameraConst * yMin - 10
    }
};

export const initAxesData = {
    radius: 0.1,
    color: initColors.axes,
    bounds,
    tickDistance: 10,
    tickRadius: 1.5,
    show: true,
    showLabels: true,
    labelStyle
};

const initGridData = {
    bounds,
    show: true,
    originColor: 0x3f405c
};

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 0.85;

const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.solution),
    side: THREE.FrontSide
});

solutionMaterial.transparent = true;
solutionMaterial.opacity = 0.6;

const solutionCurveRadius = 0.25;

const pointMaterial = solutionMaterial.clone();
pointMaterial.transparent = false;
pointMaterial.opacity = 0.8;

const testFuncMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.testFunc),
    side: THREE.FrontSide
});

testFuncMaterial.transparent = true;
testFuncMaterial.opacity = 0.6;

const testFuncRadius = 0.05;

const testFuncH = 0.1;

const capacityMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.testFunc),
    side: THREE.FrontSide
});

capacityMaterial.transparent = true;
capacityMaterial.opacity = 0.4;

const initAVal = 0.01;

const initKVal = 2;

const initApproxHValue = 0.1;

const LatexLogisticEquation = '\\frac{dy}{dx} = k \\!\\cdot\\! y - a \\!\\cdot\\! y^2';

//------------------------------------------------------------------------

export default function App() {
    const [arrowGridData, setArrowGridData] = useState(initArrowGridData);

    const [axesData, setAxesData] = useState(initAxesData);

    const [gridData, setGridData] = useState(initGridData);

    const [controlsData, setControlsData] = useState(initControlsData);

    const [colors, setColors] = useState(initColors);

    const [initialPt, setInitialPt] = useState(null);

    const [approxH, setApproxH] = useState(initApproxHValue);

    const [aVal, setAVal] = useState(initAVal);

    const [kVal, setKVal] = useState(initKVal);

    const [aSliderMax, setASliderMax] = useState(30);

    const [sigDig, setSigDig] = useState(1);

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ gridData, threeCBs, originRadius: 0.1 });
    use2DAxes({ threeCBs, axesData });

    useEffect(() => {
        setArrowGridData(({ func, ...rest }) => ({
            func: (x, y) => initKVal * y - initAVal * y * y,
            ...rest
        }));
    }, []);

    //------------------------------------------------------------------------
    //
    // effect to make camera look at median point

    useEffect(() => {
        if (!threeCBs) return;

        //threeCBs.setCameraLookAt([(xMax+xMin)/2,(yMin+yMax)/2,0]);
        //console.log('set camera to look at: ', [(xMax+xMin)/2,(yMin+yMax)/2,0]);
    }, [threeCBs]);

    //------------------------------------------------------------------------
    //
    //arrowGrid effect

    useEffect(() => {
        if (!threeCBs) return;

        const arrowGrid = ArrowGrid(arrowGridData);

        threeCBs.add(arrowGrid.getMesh());

        return () => {
            threeCBs.remove(arrowGrid.getMesh());
            arrowGrid.dispose();
        };
    }, [threeCBs, arrowGridData]);

    //------------------------------------------------------------------------
    //
    // solution effect

    const clickCB = useCallback(
        (pt) => {
            if (controlsEnabled) {
                setInitialPt((s) => s);
                return;
            }

            // if user clicks too close to boundary, don't want to deal with it
            if (pt.x > xMax - 0.25 || pt.x < xMin + 0.25) {
                setInitialPt(null);
                return;
            }

            setInitialPt([pt.x, pt.y]);
        },
        [controlsEnabled]
    );

    useEffect(() => {
        if (!threeCBs || !initialPt) return;

        const dfag = DirectionFieldApproxGeom({
            func: arrowGridData.func,
            initialPt,
            bounds,
            h: approxH,
            radius: solutionCurveRadius
        });

        const mesh = new THREE.Mesh(dfag, solutionMaterial);

        threeCBs.add(mesh);

        const ptGeom = new THREE.SphereBufferGeometry(solutionCurveRadius * 2, 15, 15).translate(
            initialPt[0],
            initialPt[1],
            0
        );

        const ptMesh = new THREE.Mesh(ptGeom, pointMaterial);
        threeCBs.add(ptMesh);

        return () => {
            threeCBs.remove(mesh);
            dfag.dispose();

            threeCBs.remove(ptMesh);
            ptGeom.dispose();
        };
    }, [threeCBs, initialPt, bounds, arrowGridData.func, approxH]);

    //------------------------------------------------------------------------
    //
    // when sliders change:

    // change the function value

    useEffect(() => {
        setArrowGridData(({ func, ...rest }) => ({
            func: (x, y) => kVal * y - aVal * y * y,
            ...rest
        }));
    }, [aVal, kVal]);

    // change the capacity line
    useEffect(() => {
        if (aVal === 0) return;

        if (!threeCBs) return;

        const path = new THREE.LineCurve3(
            new THREE.Vector3(xMin, kVal / aVal),
            new THREE.Vector3(xMax, kVal / aVal)
        );

        const geom = new THREE.TubeBufferGeometry(path, 16, testFuncRadius, 8, false);

        const mesh = new THREE.Mesh(geom, capacityMaterial);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [aVal, kVal, threeCBs]);

    //------------------------------------------------------------------------
    //

    const resetCameraCB = useCallback(() => {
        if (controlsEnabled) {
            setControlsEnabled(false);
            threeCBs.setCameraPosition(initCameraData.position, initCameraData.up);
            threeCBs.resetControls();
            threeCBs.changeControls(initControlsData);
        } else {
            setControlsEnabled(true);
            //threeCBs.resetControls();
            threeCBs.changeControls(secControlsData);
        }
    }, [controlsEnabled, threeCBs]);

    return (
        <FullScreenBaseComponent backgroundColor={colors.controlBar} fonts={fonts}>
            <ControlBar
                height={controlBarHeight}
                fontSize={initFontSize * controlBarFontSize}
                padding='.5em'>
                <div
                    css={{
                        margin: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        padding: '.5em 1em',
                        fontSize: '1.25em',
                        borderRight: '1px solid',
                        flex: 5
                    }}>
                    <div
                        css={{
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            padding: '0em 3em'
                        }}>
                        <div css={{ padding: '.25em 0', textAlign: 'center' }}>
                            Logistic equation
                        </div>
                        <div
                            css={{ padding: '.25em 0' }}
                            dangerouslySetInnerHTML={{
                                __html: katex.renderToString(LatexLogisticEquation)
                            }}
                        />
                    </div>
                    <div
                        css={{
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            padding: '0em 2em'
                        }}>
                        <Slider
                            userCss={{ padding: '.25em 0em' }}
                            value={aVal}
                            CB={(val) => setAVal(val)}
                            label={'a'}
                            max={xMax}
                            min={0}
                        />

                        <Slider
                            userCss={{ padding: '.25em 0em' }}
                            value={kVal}
                            CB={(val) => setKVal(val)}
                            label={'k'}
                            max={aVal * yMax}
                        />
                    </div>
                </div>

                <ArrowGridOptions
                    userCss={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 4,
                        paddingTop: '.5em',
                        paddingBottom: '.5em',
                        paddingLeft: '1em',
                        paddingRight: '2em'
                    }}
                    initDensity={1 / arrowGridData.gridSqSize}
                    initLength={arrowGridData.arrowLength}
                    initApproxH={approxH}
                    densityCB={useCallback(
                        (val) =>
                            setArrowGridData((agd) => ({ ...agd, gridSqSize: Number(1 / val) })),
                        []
                    )}
                    lengthCB={useCallback(
                        (val) => setArrowGridData((agd) => ({ ...agd, arrowLength: Number(val) })),
                        []
                    )}
                    approxHCB={useCallback((val) => setApproxH(Number(val)), [])}
                />
            </ControlBar>

            <Main height={100 - controlBarHeight} fontSize={initFontSize * controlBarFontSize}>
                <ThreeSceneComp
                    ref={threeSceneRef}
                    initCameraData={initCameraData}
                    controlsData={controlsData}
                    clearColor={initColors.clearColor}
                />
                <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} />
                <ResetCameraButton
                    key='resetCameraButton'
                    onClickFunc={resetCameraCB}
                    color={controlsEnabled ? colors.controlBar : null}
                    userCss={{ top: '85%', left: '5%', userSelect: 'none' }}
                />
            </Main>
        </FullScreenBaseComponent>
    );
}

function Slider({
    value,
    step = 0.1,
    CB = () => null,
    sigDig = 2,
    min = 0,
    max = 10,
    label = '',
    userCss = {}
}) {
    return (
        <div style={userCss}>
            <input
                name='n'
                type='range'
                value={value}
                step={step}
                onChange={(e) => CB(e.target.value)}
                min={min}
                max={max}
            />
            <label css={{ padding: '0em .5em' }} htmlFor='range_n'>
                {label + ' = ' + round(value, sigDig).toString()}
            </label>
        </div>
    );
}

function round(x, n = 2) {
    // x = -2.336596841557143

    return Number((x * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n);
}
