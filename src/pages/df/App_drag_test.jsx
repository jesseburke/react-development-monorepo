import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import './styles.css';

import { ThreeSceneComp } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import FunctionInput from '../../components/FunctionInput.jsx';
import ClickablePlaneComp from '../../components/ClickablePlaneComp.jsx';
import Input from '../../components/Input.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';

import funcParser from '../../utils/funcParser.jsx';

import GridAndOriginTS from '../../ThreeSceneComps/GridAndOrigin.jsx';
import Axes2DTS from '../../ThreeSceneComps/Axes2D.jsx';
import ArrowGridTS from '../../ThreeSceneComps/ArrowGrid.jsx';
import DirectionFieldApproxTS from '../../ThreeSceneComps/DirectionFieldApprox.jsx';
import SphereTS from '../../ThreeSceneComps/Sphere.jsx';

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

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.ROTATE },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

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

// percentage of screen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const fontSize = 1;
const controlBarFontSize = 1;

const pointMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initColors.solution),
    side: THREE.FrontSide
});
pointMaterial.transparent = false;
pointMaterial.opacity = 0.8;

const initAxesData = {
    radius: 0.01,
    show: true,
    showLabels: true,
    labelStyle
};

const funcStr = 'x*y*sin(x+y)/10';

const initState = {
    bounds: { xMin: -20, xMax: 20, yMin: -20, yMax: 20 },
    arrowDensity: 1,
    arrowLength: 0.7,
    funcStr,
    func: funcParser(funcStr),
    initialPt: [2, 2],
    approxH: 0.1
};

//------------------------------------------------------------------------

export default function App() {
    const [state, setState] = useState({ ...initState });

    const dragCB = useCallback((event) => {
        if (!event.object.getWorldPosition) {
            setState((s) => s);
            return;
        }

        const vec = new THREE.Vector3();
        event.object.getWorldPosition(vec);

        setState(({ initialPt, ...rest }) => ({ initialPt: [vec.x, vec.y], ...rest }));
    }, []);

    const funcInputCallback = useCallback((newFunc, newFuncStr) => {
        setState(({ func, funcStr, ...rest }) => ({
            func: newFunc,
            funcStr: newFuncStr,
            ...rest
        }));
    }, []);

    const clickCB = useCallback((pt) => {
        setState(({ initialPt, ...rest }) => ({ initialPt: [pt.x, pt.y], ...rest }));
    }, []);

    const ipxCB = useCallback((x) => {
        setState(({ initialPt, ...rest }) => ({ initialPt: [Number(x), initialPt[1]], ...rest }));
    }, []);

    const ipyCB = useCallback((y) => {
        setState(({ initialPt, ...rest }) => ({ initialPt: [initialPt[0], Number(y)], ...rest }));
    }, []);

    return (
        <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
            <ControlBar
                height={controlBarHeight}
                fontSize={fontSize * controlBarFontSize}
                padding='0em'
            >
                <div className='center-flex-row border-right'>
                    <FunctionInput
                        onChangeFunc={funcInputCallback}
                        initFuncStr={state.funcStr}
                        leftSideOfEquation='dy/dx ='
                    />
                </div>
                <div>
                    <span>
                        <span>Initial Point: </span>
                        <Input initValue={state.initialPt[0]} onC={ipxCB} />
                        <span> , </span>
                        <Input initValue={state.initialPt[1]} onC={ipyCB} />
                    </span>
                </div>
            </ControlBar>

            <Main height={100 - controlBarHeight} fontSize={fontSize * controlBarFontSize}>
                <ThreeSceneComp initCameraData={initCameraData} controlsData={initControlsData}>
                    <GridAndOriginTS
                        gridQuadSize={initAxesData.length}
                        gridShow={initState.gridShow}
                    />
                    <Axes2DTS
                        bounds={state.bounds}
                        radius={initAxesData.radius}
                        show={initAxesData.show}
                        showLabels={initAxesData.showLabels}
                        labelStyle={labelStyle}
                        yLabel='t'
                        color={initColors.axes}
                    />
                    <ArrowGridTS
                        func={state.func}
                        bounds={state.bounds}
                        arrowDensity={state.arrowDensity}
                        arrowLength={state.arrowLength}
                        color={initColors.arrows}
                    />
                    <DirectionFieldApproxTS
                        color={initColors.solution}
                        initialPt={state.initialPt}
                        bounds={state.bounds}
                        func={state.func}
                        approxH={state.approxH}
                    />
                    <SphereTS
                        color={initColors.solution}
                        position={state.initialPt}
                        dragCB={dragCB}
                        radius={0.25}
                    />
                    <ClickablePlaneComp clickCB={clickCB} />
                </ThreeSceneComp>
            </Main>
        </FullScreenBaseComponent>
    );
}
