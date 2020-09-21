import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import TexDisplayCompR from '../../components/TexDisplayCompRecoil.jsx';
import TexDisplayComp from '../../components/TexDisplayComp.jsx';
import InitialCondsComp from '../../components/InitialCondsComp.jsx';

import GridAndOrigin from '../../ThreeSceneComps/GridAndOriginRecoil.jsx';
import Axes2D from '../../ThreeSceneComps/Axes2DRecoil.jsx';
import Sphere from '../../ThreeSceneComps/SphereRecoil.jsx';
import FunctionGraph2D from '../../ThreeSceneComps/FunctionGraph2DRecoil.jsx';

import { fonts, labelStyle } from './constants.jsx';
import { processNum } from '../../utils/BaseUtils.jsx';

import {
    decode,
    encode,
    atomArray,
    boundsAtom,
    BoundsInput,
    aValAtom,
    bValAtom,
    funcAtom,
    solnTexStrAtom,
    initialPoint1Atom,
    initialPoint2Atom,
    initialPoint1ColorAtom,
    initialPoint2ColorAtom,
    InitialPointsInput,
    CoefficientInput,
    xLabelAtom,
    yLabelAtom,
    texEquationAtom,
    solutionCurveOptionsAtom,
    SolutionCurveOptionsInput
} from './App_sec_order_data.jsx';

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

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 15;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 0.85;

const initAVal = 0.2;
const initBVal = 3.0;

const initInitConds = [
    [4, 7],
    [7, 5]
];

const initPrecision = 4;

//------------------------------------------------------------------------

export default function App() {
    const [aVal, setAVal] = useState(processNum(initAVal, initPrecision));

    // this init value should be between the min and max for b
    const [bVal, setBVal] = useState(processNum(initBVal, initPrecision));

    const [initialConds, setInitialConds] = useState(initInitConds);

    //----------------------------------------

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    // following is hacky way to get three displayed on render
    useEffect(() => {
        if (!threeCBs || !threeSceneRef) return;

        window.dispatchEvent(new Event('resize'));
    }, [threeCBs, threeSceneRef]);

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

    const css2 = useRef({ padding: '.25em 0', fontSize: '1.25em' }, []);

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
        <JProvider>
            <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
                <ControlBar
                    height={controlBarHeight}
                    fontSize={initFontSize * controlBarFontSize}
                    padding='.5em'
                >
                    <div style={css1.current}>
                        <div style={css3.current}>
                            <div style={css4.current}>
                                2nd order linear, w/ constant coefficients
                            </div>
                            <div style={{ whiteSpace: 'nowrap' }}>
                                <TexDisplayCompR userCss={css2.current} strAtom={texEquationAtom} />
                            </div>
                        </div>

                        <CoefficientInput />
                    </div>

                    <div style={css6.current}>
                        <div style={css4.current}>
                            <TexDisplayComp
                                userCss={css2.current}
                                str={`a^2 - 4b = ${
                                    processNum(
                                        Number.parseFloat(aVal.str) * Number.parseFloat(aVal.str) -
                                            4 * Number.parseFloat(bVal.str),
                                        initPrecision
                                    ).texStr
                                }`}
                            />
                        </div>
                        <div style={css7.current}>
                            <TexDisplayCompR userCss={css2.current} strAtom={solnTexStrAtom} />
                        </div>
                    </div>
                    <InitialPointsInput />
                </ControlBar>

                <Main height={100 - controlBarHeight} fontSize={initFontSize * controlBarFontSize}>
                    <ThreeSceneComp
                        ref={threeSceneRef}
                        initCameraData={initCameraData}
                        controlsData={initControlsData}
                        clearColor={initColors.clearColor}
                    >
                        <GridAndOrigin
                            boundsAtom={boundsAtom}
                            gridQuadSize={initAxesData.length}
                            gridShow={true}
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
                        <Sphere
                            color={initialPoint1ColorAtom}
                            dragPositionAtom={initialPoint1Atom}
                            radius={0.25}
                        />
                        <Sphere
                            color={initialPoint2ColorAtom}
                            dragPositionAtom={initialPoint2Atom}
                            radius={0.25}
                        />
                        <FunctionGraph2D
                            funcAtom={funcAtom}
                            boundsAtom={boundsAtom}
                            curveOptionsAtom={solutionCurveOptionsAtom}
                        />
                    </ThreeSceneComp>
                </Main>
            </FullScreenBaseComponent>
        </JProvider>
    );
}
