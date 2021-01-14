import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { Helmet } from 'react-helmet';

import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import { FunctionAndBoundsInputXT as FunctionAndBoundsInput } from '../../components/FunctionAndBoundsInput.jsx';

import CanvasComp from '../../components/CanvasComp.jsx';

import Axes2D from '../../CanvasComps/Axes2D.jsx';
import FunctionGraph2D from '../../CanvasComps/FunctionGraph2D.jsx';

import { funcParserXT as funcParser } from '../../utils/funcParser.jsx';

//------------------------------------------------------------------------
//
// initial data
//

const initColors = {
    arrows: '#C2374F',
    plane: '#82BFCD',
    axes: '#181A2A', //0A2C3C',
    controlBar: '#181A2A', //0A2C3C',
    clearColor: '#f0f0f0',
    funcGraph: '#E53935'
};

const initFuncStr = '4*e^(-(x-2*t)^2)+sin(x+t)-cos(x-t)'; //'2*e^(-(x-t)^2)+sin(x+t)-cos(x-t)';//'2*e^(-(x-t)^2)';

// while it's assumed xMin and tMin are zero; it's handy to keep them around to not break things
const initBounds = { xMin: 0, xMax: 10, tMin: 0, tMax: 10, zMin: -5, zMax: 5 };

const xLength = initBounds.xMax;
const tLength = initBounds.tMax;

const initCameraData = {
    position: [(15.7 / 20) * xLength, -(13.1 / 20) * tLength, 9.79], //[40, 40, 40],
    up: [0, 0, 1]
};

const initState = {
    bounds: initBounds,
    funcStr: initFuncStr,
    func: funcParser(initFuncStr),
    gridShow: true,
    cameraData: Object.assign({}, initCameraData)
};

const fonts = "'Helvetica', 'Hind', sans-serif";

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 15;
const mainHeight = 100 - controlBarHeight;

const aspectRatio = window.innerWidth / window.innerHeight;
const aspectRatioOfMain = aspectRatio / (mainHeight / 100);

// (relative) font sizes (first in em's)
const initFontSize = 1;
const percControlBar = 1.25;
const percDrawer = 0.85;

const overhang = 2;
const canvasXOverhang = 1;

//------------------------------------------------------------------------

export default function App() {
    const [state, setState] = useState(Object.assign({}, initState));

    const [bounds, setBounds] = useState(initState.bounds);

    const [t0, setT0] = useState(0);

    //------------------------------------------------------------------------
    //
    // init effects

    const axesBounds = useRef({
        xMin: -overhang,
        xMax: bounds.xMax + overhang,
        yMin: -overhang,
        yMax: bounds.tMax + overhang,
        zMin: bounds.zMin,
        zMax: bounds.zMax
    });

    useEffect(() => {
        axesBounds.current = {
            xMin: -overhang,
            xMax: bounds.xMax + overhang,
            yMin: -overhang,
            yMax: bounds.tMax + overhang,
            zMin: bounds.zMin,
            zMax: bounds.zMax
        };
    }, [bounds]);

    const twoFunc = useCallback((x) => state.func(x, t0), [t0, state.func]);

    const boundMemo = React.useMemo(
        () => ({ ...state.bounds, xMin: -canvasXOverhang + state.bounds.xMin }),
        [state.bounds]
    );

    //------------------------------------------------------------------------
    //
    // callbacks

    const funcAndBoundsInputCB = useCallback((newBounds, newFuncStr) => {
        setState(({ bounds, func, funcStr, ...rest }) => ({
            funcStr: newFuncStr,
            func: funcParser(newFuncStr),
            bounds: newBounds,
            ...rest
        }));
    }, []);

    return (
        <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
            <Helmet>
                <title>Vibrating string</title>
                <meta name='viewport' content='width=device-width, user-scalable=no' />
            </Helmet>

            <ControlBar height={controlBarHeight} fontSize={initFontSize * percControlBar}>
                <FunctionAndBoundsInput
                    onChangeFunc={funcAndBoundsInputCB}
                    initFuncStr={state.funcStr}
                    initBounds={bounds}
                    leftSideOfEquation='s(x,t) ='
                />
            </ControlBar>

            <Main height={mainHeight} fontSize={initFontSize * percDrawer}>
                <CanvasComp aspectRatio={aspectRatioOfMain}>
                    <Axes2D
                        bounds={axesBounds.current}
                        lineWidth={5}
                        color={initColors.controlBar}
                        yLabel='z'
                    />
                    <FunctionGraph2D func={twoFunc} bounds={boundMemo} />
                </CanvasComp>
            </Main>
        </FullScreenBaseComponent>
    );
}
