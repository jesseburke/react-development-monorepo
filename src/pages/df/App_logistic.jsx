import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import ClickablePlaneComp from '../../components/ClickablePlaneComp.jsx';
import ArrowGridOptions from '../../components/ArrowGridOptions.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import TexDisplayComp from '../../components/TexDisplayComp.jsx';
import Slider from '../../components/Slider.jsx';

import GridAndOriginTS from '../../ThreeSceneComps/GridAndOriginTS.jsx';
import Axes2DTS from '../../ThreeSceneComps/Axes2DTS.jsx';
import ArrowGridTS from '../../ThreeSceneComps/ArrowGridTS.jsx';
import DirectionFieldApproxTS from '../../ThreeSceneComps/DirectionFieldApproxTS.jsx';

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
    arrowLength: 0.75
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

const capacityMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.testFunc),
    side: THREE.FrontSide
});

capacityMaterial.transparent = true;
capacityMaterial.opacity = 0.4;

const initAVal = 1.1;

const initKVal = 4.8;

const initApproxHValue = 0.01;

const logisticEquationTex = '\\frac{dy}{dx} = k \\!\\cdot\\! y - a \\!\\cdot\\! y^2';

const initialInitialPt = [1, 1];

const precision = 3;

//------------------------------------------------------------------------

export default function App() {
    const [arrowGridData, setArrowGridData] = useState(initArrowGridData);

    const [bounds, setBounds] = useState(initBounds);

    const [controlsData, setControlsData] = useState(initControlsData);

    const [colors, setColors] = useState(initColors);

    const [func, setFunc] = useState({ func: (x, y) => initKVal * y - initAVal * y * y });

    const [initialPt, setInitialPt] = useState(initialInitialPt);

    const [meshArray, setMeshArray] = useState(null);

    const [approxH, setApproxH] = useState(initApproxHValue);

    const [aVal, setAVal] = useState(initAVal);

    const [kVal, setKVal] = useState(initKVal);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

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
        if (!meshArray || !meshArray[0]) {
            setInitialPt((p) => p);
            return;
        }

        const vec = new THREE.Vector3();

        // this will be where new position is stored
        meshArray[0].getWorldPosition(vec);

        setInitialPt([vec.x, vec.y]);
    }, [meshArray]);

    useDraggableMeshArray({ meshArray, threeCBs, dragCB, dragendCB: dragCB });

    // change initial point mesh if initialPoint changes

    useEffect(() => {
        if (!threeCBs) return;

        if (!meshArray || !meshArray[0] || !initialPt) return;

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

    const clickCB = useCallback(
        (pt) => {
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
        [bounds]
    );

    //------------------------------------------------------------------------
    //
    // when sliders change:

    // change the function value

    useEffect(() => {
        setFunc({ func: (x, y) => kVal * y - aVal * y * y });
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

    const css1 = useRef(
        {
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '.5em 1em',
            fontSize: '1.25em',
            borderRight: '1px solid',
            flex: 5
        },
        []
    );

    const css2 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0em 3em'
        },
        []
    );

    const css3 = useRef({ padding: '.5em 0' }, []);

    const css4 = useRef({ padding: '.25em 0', textAlign: 'center' }, []);

    const css5 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0em 2em'
        },
        []
    );

    const css6 = useRef(
        {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 4,
            paddingTop: '.5em',
            paddingBottom: '.5em',
            paddingLeft: '1em',
            paddingRight: '2em'
        },
        []
    );

    return (
        <FullScreenBaseComponent backgroundColor={colors.controlBar} fonts={fonts}>
            <ControlBar
                height={controlBarHeight}
                fontSize={initFontSize * controlBarFontSize}
                padding='.5em'
            >
                <div style={css1.current}>
                    <div style={css2.current}>
                        <div style={css4.current}>Logistic equation</div>
                        <TexDisplayComp userCss={css3.current} str={logisticEquationTex} />
                    </div>
                    <div css={css5.current}>
                        <Slider
                            userCss={css3.current}
                            value={Number.parseFloat(aVal)}
                            CB={(val) => setAVal(val)}
                            label={'a'}
                            max={xMax}
                            min={0}
                            precision={precision}
                        />

                        <Slider
                            userCss={css3.current}
                            value={Number.parseFloat(kVal)}
                            CB={(val) => setKVal(val)}
                            label={'k'}
                            max={aVal * yMax}
                            precision={precision}
                        />
                    </div>
                </div>

                <ArrowGridOptions
                    userCss={css6.current}
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
                <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} />
            </Main>
        </FullScreenBaseComponent>
    );
}
