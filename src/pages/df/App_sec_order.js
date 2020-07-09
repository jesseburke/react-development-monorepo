import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.js';
import ControlBar from '../../components/ControlBar.js';
import Main from '../../components/Main.js';
import funcParser from '../../utils/funcParser.js';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.js';
import TexDisplayComp from '../../components/TexDisplayComp.js';
import Slider from '../../components/Slider.js';
import InitialCondsComp from '../../components/InitialCondsComp.js';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use2DAxes from '../../graphics/use2DAxes.js';
import FunctionGraph2DGeom from '../../graphics/FunctionGraph2DGeom.js';
import useDraggableMeshArray from '../../graphics/useDraggableMeshArray.js';

import useDebounce from '../../hooks/useDebounce.js';

import { fonts, labelStyle } from './constants.js';
import { processNum } from '../../utils/BaseUtils.js';

import { solnStrs } from '../../math/differentialEquations/secOrderConstantCoeff.js';

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

const xMin = -50,
    xMax = 50;
const yMin = -50,
    yMax = 50;
const initBounds = { xMin, xMax, yMin, yMax };

const gridBounds = { xMin, xMax, yMin: xMin, yMax: xMax };

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

const pointMaterial = solutionMaterial.clone();
pointMaterial.transparent = false;
pointMaterial.opacity = 0.8;

const testFuncMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.testFunc),
    side: THREE.FrontSide
});

//testFuncMaterial.transparent = true;
//testFuncMaterial.opacity = .6;

const initAVal = 0.2;
const initBVal = 3.0;
// will have -abBound < a^2 - 4b > abBound
const abBound = 20;
const aMax = 5;
const aMin = -5;
const aStep = 0.1;

const LatexSecOrderEquation = '(\\frac{d}{dx})^2(y) + a \\cdot \\frac{d}{dx}(y) + b \\cdot y  = 0';

const initInitConds = [
    [4, 7],
    [7, 5]
];

const initialPointMeshRadius = 0.4;

// in msec, for dragging
const dragDebounceTime = 7;

const initSigDig = 3;

const initPrecision = 4;
const initCondsPrecision = 4;
const sliderPrecision = 3;

//------------------------------------------------------------------------

export default function App() {
    const [bounds, setBounds] = useState(initBounds);

    const [aVal, setAVal] = useState(processNum(initAVal, initPrecision));

    // this init value should be between the min and max for b
    const [bVal, setBVal] = useState(processNum(initBVal, initPrecision));

    const [initialConds, setInitialConds] = useState(initInitConds);

    const [meshArray, setMeshArray] = useState(null);

    const [solnStr, setSolnStr] = useState(null);

    const [solnTexStr, setSolnTexStr] = useState(null);

    const [sigDig, setSigDig] = useState(initSigDig);

    const [precision, setPrecision] = useState(initPrecision);

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    //------------------------------------------------------------------------
    //
    // initial effects

    const debouncedInitialConds = useDebounce(initialConds, dragDebounceTime);

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

    // make the meshes for the initial points
    useEffect(() => {
        if (!threeCBs) return;

        const geometry1 = new THREE.SphereBufferGeometry(initialPointMeshRadius, 15, 15);
        const material1 = new THREE.MeshBasicMaterial({ color: initColors.firstPt });

        const mesh1 = new THREE.Mesh(geometry1, material1)
            .translateX(initInitConds[0][0])
            .translateY(initInitConds[0][1]);

        threeCBs.add(mesh1);
        //console.log('effect based on initialConds called');

        const geometry2 = new THREE.SphereBufferGeometry(initialPointMeshRadius, 15, 15);
        const material2 = new THREE.MeshBasicMaterial({ color: initColors.secPt });

        material2.transparent = true;
        material2.opacity = 0.5;

        const mesh2 = new THREE.Mesh(geometry2, material2)
            .translateX(initInitConds[1][0])
            .translateY(initInitConds[1][1]);

        threeCBs.add(mesh2);

        setMeshArray([mesh1, mesh2]);

        return () => {
            if (mesh1) threeCBs.remove(mesh1);
            geometry1.dispose();
            material1.dispose();

            if (mesh2) threeCBs.remove(mesh2);
            geometry2.dispose();
            material2.dispose();
        };
    }, [threeCBs]);

    //-------------------------------------------------------------------------
    //
    // make initial condition points draggable

    const dragCB = useCallback(
        (meshIndex) => {
            const vec = new THREE.Vector3();

            // this will be where new position is stored
            meshArray[meshIndex].getWorldPosition(vec);

            setInitialConds((initCondArray) =>
                initCondArray.map((ic, index) => {
                    if (index !== meshIndex) return ic;
                    return [
                        processNum(vec.x, initCondsPrecision).str,
                        processNum(vec.y, initCondsPrecision).str
                    ];
                })
            );
        },
        [meshArray]
    );

    useDraggableMeshArray({ threeCBs, meshArray, dragCB, dragendCB: dragCB });

    //------------------------------------------------------------------------
    //
    // when initialConds change, move the initialPointMeshs

    useEffect(() => {
        const ic = debouncedInitialConds;

        if (!threeCBs) return;

        if (!meshArray) return;

        let vec1 = new THREE.Vector3();
        let vec2 = new THREE.Vector3();

        meshArray[0].getWorldPosition(vec1);
        meshArray[1].getWorldPosition(vec2);

        const [d1, e1] = [vec1.x - ic[0][0], vec1.y - ic[0][1]];
        const [d2, e2] = [vec2.x - ic[1][0], vec2.y - ic[1][1]];

        if (d1 != 0) {
            meshArray[0].translateX(-d1);
        }
        if (e1 != 0) {
            meshArray[0].translateY(-e1);
        }
        if (d2 != 0) {
            meshArray[1].translateX(-d2);
        }
        if (e2 != 0) {
            meshArray[1].translateY(-e2);
        }
    }, [threeCBs, meshArray, debouncedInitialConds]);

    //------------------------------------------------------------------------
    //
    // change solnStr and solnTexStr

    useEffect(() => {
        const c = solnStrs(
            Number.parseFloat(aVal.str),
            Number.parseFloat(bVal.str),
            debouncedInitialConds,
            precision
        );

        if (!c) {
            setSolnStr(null);
            setSolnTexStr(null);

            return;
        }

        setSolnStr(c.str);
        setSolnTexStr(c.texStr);
    }, [aVal, bVal, debouncedInitialConds, sigDig]);

    //------------------------------------------------------------------------
    //
    // solution display effect

    useEffect(() => {
        if (!threeCBs || !solnStr) return;

        const solnFunc = funcParser(solnStr);

        const geom = FunctionGraph2DGeom({ func: solnFunc, bounds });

        const mesh = new THREE.Mesh(geom, testFuncMaterial);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [threeCBs, bounds, solnStr]);

    const css1 = useRef(
        {
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '.5em .5em',
            fontSize: '1.25em',
            borderRight: '1px solid',
            flex: 5
        },
        []
    );

    const css2 = useRef({ padding: '.25em 0' }, []);

    const css3 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0em 2em'
        },
        []
    );

    const css4 = useRef({ padding: '.25em 0', textAlign: 'center' }, []);

    const css5 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0em 1em'
        },
        []
    );

    const css6 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0em 2em',
            flex: 5,
            height: '100%',
            borderRight: '1px solid'
        },
        []
    );

    const css7 = useRef(
        {
            padding: '.5em 0',
            fontSize: '1.00em',
            whiteSpace: 'nowrap'
        },
        []
    );

    return (
        <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
            <ControlBar
                height={controlBarHeight}
                fontSize={initFontSize * controlBarFontSize}
                padding='.5em'>
                <div style={css1.current}>
                    <div style={css3.current}>
                        <div style={css4.current}>2nd order linear, w/ constant coefficients</div>
                        <div style={{ whiteSpace: 'nowrap' }}>
                            <TexDisplayComp userCss={css2.current} str={LatexSecOrderEquation} />
                        </div>
                    </div>

                    <div style={css5.current}>
                        <Slider
                            userCss={css2.current}
                            value={Number.parseFloat(aVal.str)}
                            CB={(val) => setAVal(processNum(Number.parseFloat(val), precision))}
                            label={'a'}
                            max={aMax}
                            min={aMin}
                            step={aStep}
                            precision={sliderPrecision}
                        />

                        <Slider
                            userCss={css2.current}
                            value={Number.parseFloat(bVal.str)}
                            CB={(val) => setBVal(processNum(Number.parseFloat(val), precision))}
                            label={'b'}
                            min={
                                (Number.parseFloat(aVal.str) * Number.parseFloat(aVal.str) -
                                    abBound) /
                                4
                            }
                            max={
                                (Number.parseFloat(aVal.str) * Number.parseFloat(aVal.str) +
                                    abBound) /
                                4
                            }
                            precision={sliderPrecision}
                        />
                    </div>
                </div>

                <div style={css6.current}>
                    <div style={css4.current}>
                        <TexDisplayComp
                            userCss={css2.current}
                            str={`a^2 - 4b = ${
                                processNum(
                                    Number.parseFloat(aVal.str) * Number.parseFloat(aVal.str) -
                                        4 * Number.parseFloat(bVal.str),
                                    precision
                                ).texStr
                            }`}
                        />
                    </div>
                    <div style={css7.current}>
                        <TexDisplayComp userCss={css2.current} str={solnTexStr} />
                    </div>
                </div>
                <InitialCondsComp
                    initialConds={debouncedInitialConds}
                    changeCB={useCallback((ic) => setInitialConds(ic), [])}
                />
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
