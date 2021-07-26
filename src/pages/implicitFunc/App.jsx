import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.js';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';

import funcParser from '../../utils/funcParser.jsx';
import Input from '../../components/Input.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import Button from '../../components/Button.jsx';

import useGridAndOrigin from '../../geometries/useGridAndOrigin.jsx';
import use2DAxes from '../../geometries/use2DAxes.jsx';

import ImplicitFuncGraph, {
    nextSide,
    borderingSquare,
    ptOnSide
} from '../../math/ImplicitFuncGraph.jsx';

import { round } from '../../utils/BaseUtils.js';

//------------------------------------------------------------------------
//
// initial data
//

const fonts = "'Helvetica', 'Hind', sans-serif";
const labelStyle = {
    color: 'black',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

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
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

// percentage of screen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const fontSize = 1;
const controlBarFontSize = 1;

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

testFuncMaterial.transparent = true;
testFuncMaterial.opacity = 0.6;

const testFuncRadius = 0.1;

const testFuncH = 0.01;

const dragDebounceTime = 5;

const initAxesData = {
    radius: 0.01,
    show: true,
    showLabels: true,
    labelStyle
};

const initGridData = {
    show: true
};

const funcStr = '(x^2+y^2)^3 - 4*x^2*y^2';

// sombrero
//'3*sin((3.14)*(x^2+y^2)^(1/2))/(3.14*(x^2+y^2)^(1/2))'

//
// 'y*(1-1/(x^2+y^2))'

// shifted circle
//'(x^2+y^2-x)/100-1';

// ampersand curve
// (y^2-x^2)*(x-1)*(2*x-3)-4*(x^2+y^2-2*x)^2

const quadSize = 2;
const initState = {
    bounds: { xMin: -quadSize, xMax: quadSize, yMin: -quadSize, yMax: quadSize },
    funcStr,
    func: funcParser(funcStr),
    approxH: 0.01
};

// f is a function applied to the string representing each array element

function strArrayToArray(strArray, f = Number) {
    // e.g., '2,4,-32.13' -> [2, 4, -32.13]

    return strArray.split(',').map((x) => f(x));
}

//------------------------------------------------------------------------

export default function App() {
    const [state, setState] = useState(initState);

    const [showGraph, setShowGraph] = useState(false);

    const [graphComps, setGraphComps] = useState(null);

    const [textureCanvas, setTextureCanvas] = useState(null);

    const [colors] = useState(initColors);

    const [fontState] = useState(fonts);

    const [cbhState] = useState(controlBarHeight);

    const [cbfsState] = useState(controlBarFontSize);

    const [minuscbhState] = useState(100 - controlBarHeight);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({
        threeCBs,
        bounds: initState.bounds,
        show: initGridData.show,
        originRadius: 0.1
    });

    use2DAxes({
        threeCBs,
        bounds: state.bounds,
        radius: initAxesData.radius,
        color: initColors.axes,
        show: initAxesData.show,
        showLabels: initAxesData.showLabels,
        labelStyle
    });

    useEffect(() => {
        if (!showGraph) {
            setGraphComps(null);
            setTextureCanvas(null);
            return;
        }

        const textureCanvas = ImplicitFuncGraph({
            func: state.func,
            bounds: state.bounds,
            approxH: state.approxH
        });

        //setGraphComps(compArray.map( a => a.map( ([x,y]) => new THREE.Vector3(x,y,0) ) ) );
        setTextureCanvas(textureCanvas);
    }, [showGraph, state.func, state.bounds, state.approxH]);

    useEffect(() => {
        if (!threeCBs) return; // || !graphComps || graphComps.length === 0 ) return;

        //const curveGeom = CurvedPathGeom({ compArray: graphComps, radius: .02 });
        //const curveMesh = new THREE.Mesh( curveGeom, solutionMaterial );
        //threeCBs.add(curveMesh);

        let planeGeom, planeTexture, planeMaterial, mesh;

        if (textureCanvas) {
            planeGeom = new THREE.PlaneGeometry(
                state.bounds.xMax - state.bounds.xMin,
                state.bounds.yMax - state.bounds.yMin
            );
            planeTexture = new THREE.CanvasTexture(textureCanvas.canvas);
            planeMaterial = new THREE.MeshBasicMaterial({ map: planeTexture });

            mesh = new THREE.Mesh(planeGeom, planeMaterial);
            threeCBs.add(mesh);
        }

        return () => {
            //threeCBs.remove(curveMesh);
            //curveGeom.dispose();

            if (mesh) threeCBs.remove(mesh);
            if (planeGeom) planeGeom.dispose();
            //if(planeTexture) planeTexture.dispose();
            if (planeMaterial) planeMaterial.dispose();
        };
    }, [state.bounds, textureCanvas, threeCBs]);

    const funcInputCB = useCallback((newFuncStr) => {
        setState(({ funcStr, func, ...rest }) => ({
            funcStr: newFuncStr,
            func: funcParser(newFuncStr),
            ...rest
        }));

        setShowGraph(false);
    }, []);

    const buttonCB = useCallback(() => setShowGraph(true), []);

    const css3 = useRef({
        margin: 0,
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0em 2em',
        alignContent: 'center',
        alignItems: 'center'
    });

    const css4 = useRef({
        margin: 0,
        width: '100%',
        position: 'relative',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '0em 2em',
        alignContent: 'center',
        alignItems: 'center'
    });

    const css5 = useRef({ textAlign: 'center', width: '12em' });

    const css6 = useRef({ paddingTop: '.5em' });

    const css7 = useRef({ textAlign: 'center' });

    const css8 = useRef({ padding: '0em' });

    const css9 = useRef({ margin: '0em 2em' });

    return (
        <FullScreenBaseComponent backgroundColor={colors.controlBar} fonts={fontState}>
            <ControlBar height={cbhState} fontSize={fontSize * cbfsState} padding='0em'>
                <div style={css3.current}>
                    <div style={css4.current}>
                        <div style={css5.current}>Function:</div>
                        <span style={css6.current}>
                            <Input size={40} initValue={state.funcStr} onC={funcInputCB} />
                        </span>
                        <Button userCss={css9.current} onClickFunc={buttonCB}>
                            Graph
                        </Button>
                    </div>
                </div>
            </ControlBar>

            <Main height={minuscbhState} fontSize={fontSize * cbfsState}>
                <ThreeSceneComp
                    ref={threeSceneRef}
                    initCameraData={initCameraData}
                    controlsData={initControlsData}
                />
            </Main>
        </FullScreenBaseComponent>
    );
}

/* <ResetCameraButton key="resetCameraButton" */
/*                               onClickFunc={resetCameraCB} */
/*                               color={controlsEnabled ? initColors.controlBar : null } */
/*                               userCss={{ top: '85%', */
/*                                          left: '5%', */
/*                                          userSelect: 'none'}}/> */
