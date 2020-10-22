import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import FunctionInput from '../../components/FunctionInput.jsx';
import CoordinateOptions from '../../components/CoordinateOptions.jsx';
import CameraOptions from '../../components/CameraOptions.jsx';
import ResetCameraButton from '../../components/ResetCameraButton.jsx';
import RightDrawer from '../../components/RightDrawer.jsx';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.jsx';
import use3DAxes from '../../graphics/use3DAxes.jsx';
import FunctionGraph3DGeom from '../../graphics/FunctionGraph3DGeom.jsx';

import funcParser from '../../utils/funcParser.jsx';

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
    clearColor: '#f0f0f0',
    funcGraph: '#E53935'
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

const initFuncStr = 'x*y*sin(x+y)/10';

const initCameraData = { position: [40, 40, 40], up: [0, 0, 1] };

const initState = {
    bounds: { xMin: -20, xMax: 20, yMin: -20, yMax: 20 },
    funcStr: initFuncStr,
    func: funcParser(initFuncStr),
    gridQuadSize: 40,
    gridShow: true,
    axesData: { show: true, showLabels: true, length: 40, radius: 0.05 },
    cameraData: Object.assign({}, initCameraData)
};

const fonts = "'Helvetica', 'Hind', sans-serif";

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 10;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const percControlBar = 1.25;
const percButton = 0.85;
const percDrawer = 0.85;

const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

// in em's
const optionsDrawerWidth = 20;

const initOptionsOpen = false;

//------------------------------------------------------------------------

export default function App() {
    const [state, setState] = useState(Object.assign({}, initState));

    const [colors, setColors] = useState(initColors);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    // determine whether various UI elements are drawn
    const [showOptsDrawer, setShowOptsDrawer] = useState(initOptionsOpen);
    const [showCameraOpts, setShowCameraOpts] = useState(false);
    const [showCoordOpts, setShowCoordOpts] = useState(false);
    const [showFuncOpts, setShowFuncOpts] = useState(false);

    //------------------------------------------------------------------------
    //
    // init effects

    useGridAndOrigin({
        threeCBs,
        gridQuadSize: state.gridQuadSize,
        gridShow: state.gridShow,
        originRadius: 0.1
    });

    use3DAxes({
        threeCBs,
        bounds: {
            xMin: -state.axesData.length,
            xMax: state.axesData.length,
            yMin: -state.axesData.length,
            yMax: state.axesData.length,
            zMin: -state.axesData.length,
            zMax: state.axesData.length
        },
        radius: state.axesData.radius,
        show: state.axesData.show,
        showLabels: state.axesData.showLabels,
        labelStyle,
        color: initColors.axes
    });

    //------------------------------------------------------------------------
    //
    // funcGraph effect

    useEffect(() => {
        if (!threeCBs) return;

        if (!state.func) return;

        const geometry = FunctionGraph3DGeom({
            func: state.func,
            bounds: state.bounds,
            meshSize: 100
        });

        const material = new THREE.MeshPhongMaterial({
            color: initColors.funcGraph,
            side: THREE.DoubleSide
        });
        material.shininess = 0;
        material.wireframe = false;

        const mesh = new THREE.Mesh(geometry, material);
        threeCBs.add(mesh);

        return () => {
            if (mesh) threeCBs.remove(mesh);
            if (geometry) geometry.dispose();
            if (material) material.dispose();
        };
    }, [threeCBs, state.func, state.bounds]);

    //------------------------------------------------------------------------
    //
    // callbacks

    const funcInputCB = useCallback((newFunc, newFuncStr) => {
        if (!newFuncStr || newFuncStr.length === 0) {
            setState(({ func, funcStr, ...rest }) => ({
                func: null,
                funcStr: newFuncStr,
                ...rest
            }));
            return;
        }

        setState(({ func, funcStr, ...rest }) => ({ func: newFunc, funcStr: newFuncStr, ...rest }));
    }, []);

    const controlsCB = useCallback((position) => {
        setState(({ cameraData, ...rest }) => ({
            cameraData: Object.assign(cameraData, { position }),
            ...rest
        }));
    }, []);

    const cameraChangeCB = useCallback(
        (position) => {
            if (position) {
                setState(({ cameraData, ...rest }) => ({
                    cameraData: Object.assign(cameraData, { position }),
                    ...rest
                }));
            }

            if (!threeCBs) return;

            threeCBs.setCameraPosition(position);
        },
        [threeCBs]
    );

    // this is imperative because we are not updating cameraData
    const resetCameraCB = useCallback(() => {
        if (!threeCBs) return;

        setState(({ cameraData, ...rest }) => ({
            cameraData: Object.assign({}, initCameraData),
            ...rest
        }));
        threeCBs.setCameraPosition(initCameraData.position);
    }, [threeCBs]);

    const gridCB = useCallback(
        ({ quadSize, show }) =>
            setState(({ gridQuadSize, gridShow, ...rest }) => ({
                gridQuadSize: quadSize,
                gridShow: show,
                ...rest
            })),
        []
    );

    const axesCB = useCallback((newAxesData) => {
        setState(({ axesData, ...rest }) => ({ axesData: newAxesData, ...rest }));
    }, []);

    return (
        <FullScreenBaseComponent backgroundColor={colors.controlBar} fonts={fonts}>
            <ControlBar height={controlBarHeight} fontSize={initFontSize * percControlBar}>
                <span>
                    <FunctionInput
                        onChangeFunc={funcInputCB}
                        initFuncStr={state.funcStr}
                        leftSideOfEquation='f(x,y) ='
                    />
                </span>
                <Button
                    fontSize={initFontSize * percButton}
                    onClickFunc={useCallback(() => setShowOptsDrawer((o) => !o), [])}
                >
                    <div>
                        <span css={{ paddingRight: '1em' }}>Options</span>
                        <span>{showOptsDrawer ? '\u{2B06}' : '\u{2B07}'} </span>
                    </div>
                </Button>
            </ControlBar>

            <Main height={100 - controlBarHeight} fontSize={initFontSize * percDrawer}>
                <ThreeSceneComp
                    ref={threeSceneRef}
                    initCameraData={initCameraData}
                    controlsData={initControlsData}
                    controlsCB={controlsCB}
                />

                <RightDrawer
                    toShow={showOptsDrawer}
                    width={optionsDrawerWidth}
                    color={colors.optionsDrawer}
                    fontSize={'1.5em'}
                >
                    <ListItem
                        width={optionsDrawerWidth - 9}
                        onClick={useCallback(() => setShowCoordOpts((s) => !s), [])}
                    >
                        Coordinates
                    </ListItem>

                    <ListItem
                        width={optionsDrawerWidth - 9}
                        onClick={useCallback(() => setShowCameraOpts((s) => !s), [])}
                    >
                        Camera
                    </ListItem>
                </RightDrawer>

                <ResetCameraButton
                    key='resetCameraButton'
                    onClickFunc={resetCameraCB}
                    color={colors.optionsDrawer}
                    userCss={{ top: '73%', left: '5%' }}
                />

                <Modal
                    show={showCoordOpts}
                    key='axesModalWindow'
                    onClose={useCallback(() => setShowCoordOpts(false), [])}
                    color={colors.optionsDrawer}
                >
                    <CoordinateOptions
                        axesData={state.axesData}
                        onAxesChange={axesCB}
                        gridQuadSize={state.gridQuadSize}
                        gridShow={state.gridShow}
                        onGridChange={gridCB}
                    />
                </Modal>

                <Modal
                    show={showCameraOpts}
                    key='cameraModal'
                    onClose={useCallback(() => setShowCameraOpts(false), [])}
                    leftPerc={80}
                    topPerc={70}
                    color={colors.optionsDrawer}
                >
                    <CameraOptions cameraData={state.cameraData} onChangeFunc={cameraChangeCB} />
                </Modal>
            </Main>
        </FullScreenBaseComponent>
    );
}

function ListItem({ children, onClick, toShow = true, width = '20' }) {
    return (
        <div
            onClick={onClick}
            css={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                width: width.toString() + 'em',
                cursor: 'pointer'
            }}
        >
            <div>{children}</div>
            <div>{toShow ? '\u2699' : '\u274C'}</div>
        </div>
    );
}
