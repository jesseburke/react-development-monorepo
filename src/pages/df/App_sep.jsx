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

import GridAndOriginTS from '../../ThreeSceneComps/GridAndOriginTS.jsx';
import Axes2DTS from '../../ThreeSceneComps/Axes2DTS.jsx';
import FunctionGraph2DTS from '../../ThreeSceneComps/FunctionGraph2DTS.jsx';
import ArrowGridTS from '../../ThreeSceneComps/ArrowGridTS.jsx';
import DirectionFieldApproxTS from '../../ThreeSceneComps/DirectionFieldApproxTS.jsx';

import useDraggableMeshArray from '../../graphics/useDraggableMeshArray.jsx';

import useDebounce from '../../hooks/useDebounce.jsx';

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

const initArrowGridData = {
    gridSqSize: 0.5,
    color: initColors.arrows,
    arrowLength: 0.7
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

const initApproxHValue = 0.1;

const LatexSepEquation = '\\frac{dy}{dx} = h(y) \\!\\cdot\\! g(x)';

const initXFuncStr = 'x';
const initXFunc = funcParser(initXFuncStr);

const initYFuncStr = 'cos(y)';
const initYFunc = funcParser(initYFuncStr);

const initTestFuncStr = 'x^2';
const initTestFunc = funcParser(initTestFuncStr);

const initialInitialPt = [2, 2];

const dragDebounceTime = 7;

//------------------------------------------------------------------------

export default function App() {
    const [bounds, setBounds] = useState(initBounds);

    const [arrowGridData, setArrowGridData] = useState(initArrowGridData);

    const [xFunc, setXFunc] = useState({ func: initXFunc });

    const [yFunc, setYFunc] = useState({ func: initYFunc });

    const [colors, setColors] = useState(initColors);

    const [initialPt, setInitialPt] = useState(initialInitialPt);

    const [meshArray, setMeshArray] = useState(null);

    const [approxH, setApproxH] = useState(initApproxHValue);

    const [testFunc, setTestFunc] = useState({ func: initTestFunc });

    const [cbfsState] = useState(controlBarFontSize);

    const [minuscbhState] = useState(100 - controlBarHeight);

    const [ifsState] = useState(initFontSize);

    const [func, setFunc] = useState({ func: (x, y) => xFunc.func(x, 0) * yFunc.func(0, y) });

    useEffect(() => {
        setFunc({ func: (x, y) => xFunc.func(x, 0) * yFunc.func(0, y) });
    }, [xFunc, yFunc]);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    //------------------------------------------------------------------------
    //
    // initial effects

    const dbInitialPt = useDebounce(initialPt, dragDebounceTime);

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

        if (!meshArray || !dbInitialPt) return;

        let vec = new THREE.Vector3();

        meshArray[0].getWorldPosition(vec);

        const [d1, e1] = [vec.x - dbInitialPt[0], vec.y - dbInitialPt[1]];

        if (d1 != 0) {
            meshArray[0].translateX(-d1);
        }
        if (e1 != 0) {
            meshArray[0].translateY(-e1);
        }
    }, [threeCBs, meshArray, dbInitialPt]);

    const clickCB = useCallback((pt) => {
        // if user clicks too close to boundary, don't want to deal with it
        if (pt.x > xMax - 0.25 || pt.x < xMin + 0.25) {
            setInitialPt(null);
            return;
        }

        setInitialPt([pt.x, pt.y]);
    }, []);

    const xFuncInputCB = useCallback(
        (newXFuncStr) => setXFunc({ func: funcParser(newXFuncStr) }),
        []
    );

    const yFuncInputCB = useCallback(
        (newYFuncStr) => setYFunc({ func: funcParser(newYFuncStr) }),
        []
    );

    const testFuncInputCB = useCallback((newFunc) => {
        setTestFunc({ func: newFunc });
    }, []);

    const css1 = useRef(
        {
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '.5em 2.5em',
            borderRight: '1px solid',
            flex: 1
        },
        []
    );

    const css2 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '1em 1.5em',
            borderRight: '1px solid',
            flex: 3
        },
        []
    );

    const css3 = useRef({ padding: '.5em 0' }, []);

    const css4 = useRef({ paddingRight: '.5em' }, []);

    const css5 = useRef(
        {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 4,
            padding: '.5em 2em'
        },
        []
    );

    const css7 = useRef({ textAlign: 'center' }, []);

    const css8 = useRef(
        {
            margin: 0,
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0em 2em',
            alignContent: 'center',
            alignItems: 'center',
            borderLeft: '1px solid'
        },
        []
    );

    const css9 = useRef({ textAlign: 'center', width: '12em' }, []);

    //------------------------------------------------------------------------
    //

    return (
        <FullScreenBaseComponent backgroundColor={colors.controlBar} fonts={fonts}>
            <ControlBar
                height={controlBarHeight}
                fontSize={initFontSize * controlBarFontSize}
                padding='.5em'
            >
                <div style={css1.current} key='1'>
                    <span style={css7.current}>Test Function</span>
                    <FunctionInput
                        onChangeFunc={testFuncInputCB}
                        initFuncStr={initTestFuncStr}
                        totalWidth='12em'
                        inputSize={10}
                        leftSideOfEquation={'\u{00177}(x) ='}
                    />
                </div>

                <div style={css2.current} key='2'>
                    <TexDisplayComp userCss={css3.current} str={LatexSepEquation} />

                    <div style={css3.current}>
                        <span style={css4.current}>
                            <span style={css4.current}>h(y) = </span>
                            <Input size={5} initValue={initYFuncStr} onC={yFuncInputCB} />
                        </span>
                        <span>
                            <span css={css4.current}>g(x) = </span>
                            <Input size={5} initValue={initXFuncStr} onC={xFuncInputCB} />
                        </span>
                    </div>
                </div>

                <ArrowGridOptions
                    userCss={css5.current}
                    initDensity={1 / arrowGridData.gridSqSize}
                    initLength={arrowGridData.arrowLength}
                    densityCB={useCallback(
                        (val) =>
                            setArrowGridData((agd) => ({ ...agd, gridSqSize: Number(1 / val) })),
                        []
                    )}
                    lengthCB={useCallback(
                        (val) => setArrowGridData((agd) => ({ ...agd, arrowLength: Number(val) })),
                        []
                    )}
                />
                <div style={css8.current}>
                    <div style={css9.current}>Solution approximation constant:</div>
                    <span style={css3.current}>
                        <Input
                            size={4}
                            initValue={approxH}
                            onC={useCallback((val) => setApproxH(Number(val)), [])}
                        />
                    </span>
                </div>
            </ControlBar>

            <Main height={minuscbhState} fontSize={ifsState * cbfsState}>
                <ThreeSceneComp
                    ref={threeSceneRef}
                    initCameraData={initCameraData}
                    controlsData={initControlsData}
                    clearColor={initColors.clearColor}
                    key='threecomp'
                >
                    <GridAndOriginTS
                        gridQuadSize={initAxesData.length}
                        gridShow={true}
                        originRadius={0}
                    />
                    <Axes2DTS
                        bounds={bounds}
                        radius={initAxesData.radius}
                        show={initAxesData.show}
                        showLabels={initAxesData.showLabels}
                        labelStyle={labelStyle}
                        yLabel='t'
                        color={initColors.axes}
                    />
                    <FunctionGraph2DTS
                        func={testFunc.func}
                        bounds={bounds}
                        color={initColors.testFunc}
                    />
                    <ArrowGridTS
                        func={func.func}
                        bounds={bounds}
                        arrowDensity={1 / arrowGridData.gridSqSize}
                        arrowLength={arrowGridData.arrowLength}
                        color={colors.arrows}
                    />
                    <DirectionFieldApproxTS
                        color={initColors.solution}
                        initialPt={initialPt}
                        bounds={bounds}
                        func={func.func}
                        approxH={approxH}
                    />
                </ThreeSceneComp>
                <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} key='clickcomp' />
            </Main>
        </FullScreenBaseComponent>
    );
}
