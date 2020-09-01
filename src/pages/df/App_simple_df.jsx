import React, { useState, useRef, useEffect, useCallback } from 'react';
import Recoil from 'recoil';
const {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    useSetRecoilState,
    useRecoilCallback,
    atomFamily
} = Recoil;

import * as THREE from 'three';

import './styles.css';

import { ThreeSceneComp } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import FunctionInput from '../../components/FunctionInput.jsx';
import ClickablePlaneComp from '../../components/RecoilClickablePlaneComp.jsx';
import Input from '../../components/Input.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';

import funcParser from '../../utils/funcParser.jsx';
import { round } from '../../utils/BaseUtils.jsx';

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
    approxH: 0.1
};

const ipAtom = atom({
    key: 'initialPosition',
    default: { x: 2, y: 2 }
});

const xselector = selector({
    key: 'xselector',
    set: ({ get, set }, newX) => set(ipAtom, { x: Number(newX), y: get(ipAtom).y })
});

const yselector = selector({
    key: 'yselector',
    set: ({ get, set }, newY) => set(ipAtom, { y: Number(newY), x: get(ipAtom).x })
});

//------------------------------------------------------------------------

export default function App() {
    const [state, setState] = useState({ ...initState });

    const funcInputCallback = useCallback((newFunc, newFuncStr) => {
        setState(({ func, funcStr, ...rest }) => ({
            func: newFunc,
            funcStr: newFuncStr,
            ...rest
        }));
    }, []);

    return (
        <RecoilRoot>
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
                    <InitialPointDisplay
                        ipAtom={ipAtom}
                        xselector={xselector}
                        yselector={yselector}
                    />
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
                            initialPtAtom={ipAtom}
                            bounds={state.bounds}
                            func={state.func}
                            approxH={state.approxH}
                        />
                        <SphereTS
                            color={initColors.solution}
                            dragPositionAtom={ipAtom}
                            radius={0.25}
                        />
                        <ClickablePlaneComp clickPositionAtom={ipAtom} />
                    </ThreeSceneComp>
                </Main>
            </FullScreenBaseComponent>
        </RecoilRoot>
    );
}

function InitialPointDisplay({ ipAtom, xselector, yselector }) {
    const initialPoint = useRecoilValue(ipAtom);

    const setXS = useSetRecoilState(xselector);
    const setYS = useSetRecoilState(yselector);

    return (
        <div>
            <span>
                <span>Initial Point: </span>
                <Input initValue={round(initialPoint.x, 3)} size={8} onC={setXS} />
                <span> , </span>
                <Input initValue={round(initialPoint.y, 3)} size={8} onC={setYS} />
            </span>
        </div>
    );
}
