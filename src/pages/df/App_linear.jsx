import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import FunctionInput from '../../components/FunctionInput.jsx';
import funcParser from '../../utils/funcParser.jsx';
import ClickablePlaneComp from '../../components/ClickablePlaneComp.jsx';
import Input from '../../components/Input.jsx';
import ArrowGridOptions from '../../components/ArrowGridOptions.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import TexDisplayComp from '../../components/TexDisplayComp.jsx';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.jsx';
import use2DAxes from '../../graphics/use2DAxes.jsx';
import FunctionGraph2DGeom from '../../graphics/FunctionGraph2DGeom.jsx';
import ArrowGridGeom from '../../graphics/ArrowGridGeom.jsx';
import DirectionFieldApproxGeom from '../../graphics/DirectionFieldApprox.jsx';
import useDraggableMeshArray from '../../graphics/useDraggableMeshArray.jsx';

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

const xMin = -20,
    xMax = 20;
const yMin = -20,
    yMax = 20;
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
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.ROTATE },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

const secControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.ROTATE, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.PAN },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    zoomSpeed: 1.25
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

const initArrowGridData = {
    gridSqSize: 0.5,
    color: initColors.arrows,
    arrowLength: 0.75
};

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 1;

const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.solution),
    side: THREE.FrontSide
});

solutionMaterial.transparent = true;
solutionMaterial.opacity = 0.6;

const solutionCurveRadius = 0.1;

const pointMaterial = solutionMaterial.clone();
pointMaterial.transparent = false;
pointMaterial.opacity = 0.8;

const testFuncMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.testFunc),
    side: THREE.FrontSide
});

testFuncMaterial.transparent = true;
testFuncMaterial.opacity = 0.6;

const testFuncRadius = 0.1;

const testFuncH = 0.1;

const initApproxHValue = 0.1;

const LatexSepEquation = '\\frac{dy}{dx} + p(x)y = q(x)';

const initPXFuncStr = '4*x/(x^2+1)';
const initPXFunc = funcParser(initPXFuncStr);

const initQXFuncStr = '12*x/(x^2+1)';
const initQXFunc = funcParser(initQXFuncStr);

const initialInitialPt = [2, 2];

//------------------------------------------------------------------------

export default function App() {
    const [arrowGridData, setArrowGridData] = useState(initArrowGridData);

    const [bounds, setBounds] = useState(initBounds);

    const [pxFunc, setPXFunc] = useState({ func: initPXFunc });

    const [qxFunc, setQXFunc] = useState({ func: initQXFunc });

    const [controlsData, setControlsData] = useState(initControlsData);

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const [initialPt, setInitialPt] = useState(initialInitialPt);

    const [meshArray, setMeshArray] = useState(null);

    const [approxH, setApproxH] = useState(initApproxHValue);

    const [testFunc, setTestFunc] = useState(null);

    const [colors, setColors] = useState(initColors);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

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
        bounds: bounds,
        radius: initAxesData.radius,
        color: initAxesData.color,
        show: initAxesData.show,
        showLabels: initAxesData.showLabels,
        labelStyle,
        xLabel: 't'
    });

    //-------------------------------------------------------------------------
    //
    // make the mesh for the initial point

    useEffect(() => {
        if (!threeCBs) return;

        const geometry = new THREE.SphereBufferGeometry(solutionCurveRadius * 2, 15, 15);
        const material = new THREE.MeshBasicMaterial({ color: initColors.solution });

        const mesh = new THREE.Mesh(geometry, material)
            .translateX(initialInitialPt[0])
            .translateY(initialInitialPt[1]);

        threeCBs.add(mesh);
        setMeshArray([mesh]);

        return () => {
            if (mesh) threeCBs.remove(mesh);
            geometry.dispose();
            material.dispose();
        };
    }, [threeCBs]);

    //-------------------------------------------------------------------------
    //
    // make initial condition point draggable

    // in this case there is no argument, because we know what is being dragged
    const dragCB = useCallback(() => {
        const vec = new THREE.Vector3();

        // this will be where new position is stored
        meshArray[0].getWorldPosition(vec);

        setInitialPt([vec.x, vec.y]);
    }, [meshArray]);

    useDraggableMeshArray({ meshArray, threeCBs, dragCB, dragendCB: dragCB });

    // change initial point mesh if initialPoint changes

    useEffect(() => {
        if (!threeCBs) return;

        if (!meshArray || !initialPt) return;

        let vec = new THREE.Vector3();

        meshArray[0].getWorldPosition(vec);

        const [d1, e1] = [vec.x - initialPt[0], vec.y - initialPt[1]];

        if (d1 != 0) {
            meshArray[0].translateX(-d1);
        }
        if (e1 != 0) {
            meshArray[0].translateY(-e1);
        }
    }, [threeCBs, meshArray, initialPt]);

    //------------------------------------------------------------------------
    //
    //arrowGrid effect

    useEffect(() => {
        if (!threeCBs) return;

        const geometry = ArrowGridGeom({
            arrowDensity: 1 / arrowGridData.gridSqSize,
            color: arrowGridData.color,
            arrowLength: arrowGridData.arrowLength,
            bounds,
            func: (x, y) => -pxFunc.func(x, 0) * y + qxFunc.func(x, 0)
        });

        const material = new THREE.MeshBasicMaterial({ color: colors.arrows });

        const mesh = new THREE.Mesh(geometry, material);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geometry.dispose();
            material.dispose();
        };
    }, [threeCBs, arrowGridData, pxFunc, qxFunc]);

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
            if (
                pt.x > bounds.xMax ||
                pt.x < bounds.xMin ||
                pt.y > bounds.yMax ||
                pt.y < bounds.yMin
            ) {
                setInitialPt(initialInitialPt);
                return;
            }

            setInitialPt([pt.x, pt.y]);
        },
        [controlsEnabled, bounds]
    );

    useEffect(() => {
        if (!threeCBs || !initialPt) return;

        const dfag = DirectionFieldApproxGeom({
            func: (x, y) => -pxFunc.func(x, 0) * y + qxFunc.func(x, 0),
            initialPt,
            bounds,
            h: approxH,
            radius: solutionCurveRadius
        });

        if (!dfag) {
            console.log('DirectionFieldApproxGeom return null object');
            return null;
        }

        const mesh = new THREE.Mesh(dfag, solutionMaterial);

        threeCBs.add(mesh);

        return () => {
            if (threeCBs) {
                if (mesh) threeCBs.remove(mesh);
            }

            dfag.dispose();
        };
    }, [threeCBs, initialPt, bounds, pxFunc, qxFunc, approxH]);

    //------------------------------------------------------------------------
    //
    // handles input for p(x) and q(x)

    const pxFuncInputCB = useCallback(
        (newPXFuncStr) => setPXFunc({ func: funcParser(newPXFuncStr) }),
        []
    );

    const qxFuncInputCB = useCallback(
        (newQXFuncStr) => setQXFunc({ func: funcParser(newQXFuncStr) }),
        []
    );

    //------------------------------------------------------------------------
    //
    // test graph effect

    const testFuncInputCB = useCallback(
        (newFunc) => {
            setTestFunc((oldFunc) => newFunc);
        },
        [testFunc]
    );

    useEffect(() => {
        if (!threeCBs || !testFunc) return;

        const geom = FunctionGraph2DGeom({ func: testFunc, bounds, radius: testFuncRadius });

        const mesh = new THREE.Mesh(geom, testFuncMaterial);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [threeCBs, testFunc, bounds]);

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

    //------------------------------------------------------------------------
    //

    const css1 = useRef(
        {
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '.5em 1em',
            borderRight: '1px solid',
            flex: 5
        },
        []
    );

    const css2 = useRef({ padding: '.25em 0', textAlign: 'center' }, []);

    const css3 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '.5em 1em',
            borderRight: '1px solid',
            flex: 4
        },
        []
    );

    const css4 = useRef({ paddingRight: '1em' }, []);

    const css5 = useRef({ paddingTop: '.5em' }, []);

    return (
        <FullScreenBaseComponent backgroundColor={colors.controlBar} fonts={fonts}>
            <ControlBar
                height={controlBarHeight}
                fontSize={initFontSize * controlBarFontSize}
                padding='.5em'>
                <div style={css1.current}>
                    <span style={css2.current}>Test Function</span>
                    <div style={{ padding: '0em' }}>
                        <FunctionInput
                            onChangeFunc={testFuncInputCB}
                            initFuncStr={''}
                            totalWidth='12em'
                            inputSize={10}
                            leftSideOfEquation={'\u{00177}(x) ='}
                        />
                    </div>
                </div>

                <div style={css3.current}>
                    <TexDisplayComp userCss={css2.current} str={LatexSepEquation} />
                    <div style={css5.current}>
                        <span style={css4.current}>
                            <span style={css4.current}>p(x) = </span>
                            <Input size={10} initValue={initPXFuncStr} onC={pxFuncInputCB} />
                        </span>
                        <span>
                            <span style={css4.current}>g(x) = </span>
                            <Input size={10} initValue={initQXFuncStr} onC={qxFuncInputCB} />
                        </span>
                    </div>
                </div>

                <ArrowGridOptions
                    userCss={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 5,
                        padding: '.5em 1em'
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
            </Main>
        </FullScreenBaseComponent>
    );
}

// <ResetCameraButton key="resetCameraButton"
//                              onClickFunc={resetCameraCB}
//                              color={controlsEnabled ? colors.controlBar : null }
//                              userCss={{ top: '85%',
//                                         left: '5%',
//                                         userSelect: 'none'}}/>
