import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { FullScreenBaseComponent } from '@jesseburke/basic-react-components';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import funcParser from '../../utils/funcParser.jsx';
import ClickablePlaneComp from '../../components/ClickablePlaneComp.jsx';
import Input from '../../components/Input.jsx';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.jsx';
import use2DAxes from '../../graphics/use2DAxes.jsx';
import ArrowGridGeom from '../../graphics/ArrowGridGeom.jsx';
import DirectionFieldApproxGeom from '../../graphics/DirectionFieldApprox.jsx';

//------------------------------------------------------------------------
//
// initial data
//

// should adjust these based on aspect ratio of users screen
const halfXSize = 10;
const halfYSize = 7;

const initColors = {
    funcGraph: '#E53935',
    axes: '#084C5E',
    label: '#83BBC9',
    controlBar: '#0A2C3C',
    optionsDrawer: '#C5CAE9'
};

const initXFuncStr = 'x';
const initXFunc = funcParser(initXFuncStr);

const initYFuncStr = 'cos(y)';
const initYFunc = funcParser(initYFuncStr);

const initFunc = (x, y) => initXFunc(x, 0) * initYFunc(0, y);

const initArrowGridData = {
    gridSqSize: 0.25,
    color: initColors.funcGraph,
    arrowLength: 0.75,
    quadSize: halfXSize,
    func: initFunc, //funcParser(initFuncStr),//(x,y) => initXFunc(x)*initYFunc(y),
    xFunc: initXFunc,
    yFunc: initYFunc
};

const labelStyle = {
    color: 'black',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

const initAxesData = {
    radius: 0.02,
    color: initColors.axes,
    length: halfXSize,
    tickDistance: 1,
    tickRadius: 2.5,
    show: true,
    showLabels: true,
    labelStyle
};

const initGridData = {
    gridSqSize: 1,
    quadSize: halfXSize,
    show: true,
    originColor: 0x3f405c
};

// how much of grid to show at start
const cameraConst = 0.75;

const initCameraData = {
    position: [0, 0, 100],
    up: [0, 0, 1],
    //fov: 75,
    near: -1,
    far: 5000,
    orthographic: {
        left: cameraConst * -halfXSize,
        right: cameraConst * halfXSize,
        top: cameraConst * halfYSize,
        bottom: cameraConst * -halfYSize
    }
};

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE, RIGHT: THREE.MOUSE.PAN },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.PAN, THREE: THREE.MOUSE.PAN },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50
};

const fonts = "'Helvetica', 'Hind', sans-serif";

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const percControlBar = 1.25;
const percButton = 0.85;
const percDrawer = 0.85;

// in em's
const optionsDrawerWidth = 20;

const initOptionsOpen = true;

const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

//------------------------------------------------------------------------

export default function App() {
    const [arrowGridData, setArrowGridData] = useState(initArrowGridData);

    // useState can't accept a function as a value, so have to enclose it in object
    const [fxy, setFxy] = useState({ func: initFunc });

    const [axesData, setAxesData] = useState(initAxesData);

    const [gridData, setGridData] = useState(initGridData);

    const [controlsData, setControlsData] = useState(initControlsData);

    const [colors, setColors] = useState(initColors);

    const [initialPt, setInitialPt] = useState(null);

    const [approxH, setApproxH] = useState(0.1);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const funcInputCallback = useCallback(
        (newFunc) => setArrowGridData(({ func, ...rest }) => ({ func: newFunc, ...rest })),
        []
    );

    const xFuncInputCB = useCallback((newFuncStr) => {
        const newXFunc = funcParser(newFuncStr);

        setArrowGridData(({ xFunc, yFunc, func, ...rest }) => ({
            xFunc: newXFunc,
            yFunc,
            func: (x, y) => newXFunc(x, 0) * yFunc(0, y),
            ...rest
        }));
    }, []);

    const yFuncInputCB = useCallback((newFuncStr) => {
        const newYFunc = funcParser(newFuncStr);

        setArrowGridData(({ yFunc, xFunc, func, ...rest }) => ({
            yFunc: newYFunc,
            xFunc,
            func: (x, y) => xFunc(x, 0) * newYFunc(0, y),
            ...rest
        }));
    }, []);

    //------------------------------------------------------------------------
    //
    // effects

    useGridAndOrigin({ gridData, threeCBs, originRadius: 0.1 });

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

    use2DAxes({ threeCBs, axesData });

    // solution effect
    useEffect(() => {
        if (!threeCBs || !initialPt) return;

        const dfag = DirectionFieldApproxGeom({ func: arrowGridData.func, initialPt, h: approxH });

        const mesh = new THREE.Mesh(dfag, solutionMaterial);

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            dfag.dispose();
        };
    }, [threeCBs, initialPt, arrowGridData.func, approxH]);

    const clickCB = useCallback((pt) => {
        // if user clicks too close to boundary, don't want to deal with it
        if (pt.x > halfXSize - 0.5 || pt.x < -halfXSize + 0.5) {
            setInitialPt(null);
            return;
        }

        setInitialPt([pt.x, pt.y]);
    }, []);

    return (
        <FullScreenBaseComponent backgroundColor={colors.controlBar} fonts={fonts}>
            <ControlBar
                height={controlBarHeight}
                fontSize={initFontSize * percControlBar}
                padding='.5em'>
                <div
                    css={{
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '40%',
                        height: '100%',
                        paddingTop: '.5em',
                        paddingBottom: '.5em',
                        paddingLeft: '3em',
                        paddingRight: '1.5em'
                    }}>
                    <span>dy/dx = h(y)g(x)</span>
                    <div>
                        <span css={{ padding: '1em' }}>
                            h(y) = <Input size={4} initValue={initYFuncStr} onC={yFuncInputCB} />
                        </span>
                        <span>
                            g(x) = <Input size={4} initValue={initXFuncStr} onC={xFuncInputCB} />
                        </span>
                    </div>
                </div>

                <div
                    css={{
                        margin: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '40%',
                        height: '100%',
                        paddingTop: '.5em',
                        paddingBottom: '.5em',
                        paddingLeft: '0em',
                        paddingRight: '1.5em'
                    }}>
                    <div
                        css={{
                            margin: 0,
                            position: 'relative',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-around',
                            alignContent: 'center',
                            alignItems: 'center'
                        }}>
                        <span>Arrow density: </span>
                        <span>
                            <Input
                                size={4}
                                initValue={1 / arrowGridData.gridSqSize}
                                onC={useCallback((val) =>
                                    setArrowGridData((agd) => ({
                                        ...agd,
                                        gridSqSize: Number(1 / val)
                                    }))
                                )}
                            />
                        </span>
                    </div>
                    <div
                        css={{
                            margin: 0,
                            position: 'relative',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-around',
                            alignContent: 'center',
                            alignItems: 'center'
                        }}>
                        <span
                            css={{
                                paddingRight: '.5em'
                            }}>
                            Arrow length:{' '}
                        </span>
                        <Input
                            size={4}
                            initdValue={arrowGridData.arrowLength}
                            onC={useCallback((val) =>
                                setArrowGridData((agd) => ({ ...agd, arrowLength: Number(val) }))
                            )}
                        />
                    </div>

                    <div
                        css={{
                            margin: 0,
                            position: 'relative',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-around',
                            alignContent: 'center',
                            alignItems: 'center'
                        }}>
                        <span
                            css={{
                                paddingRight: '.5em'
                            }}>
                            Approximation constant:{' '}
                        </span>
                        <Input
                            size={4}
                            initValue={approxH}
                            onC={useCallback((val) => setApproxH(Number(val)))}
                        />
                    </div>
                </div>
            </ControlBar>

            <Main height={100 - controlBarHeight} fontSize={initFontSize * percDrawer}>
                <ThreeSceneComp
                    ref={threeSceneRef}
                    initCameraData={initCameraData}
                    controlsData={controlsData}
                />
                <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} />
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
            }}>
            <div>{children}</div>
            <div>{toShow ? '\u2699' : '\u274C'}</div>
        </div>
    );
}
// was above, where '\u2699' is now:
//'\u2795'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.log('error: ' + error);
        console.log('errorInfo ' + errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong with the graphics; try reloading].</h1>;
        }

        return this.props.children;
    }
}
