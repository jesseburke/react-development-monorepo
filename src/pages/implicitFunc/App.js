import React, { useState, useRef, useEffect, useCallback } from 'react';

import queryString from 'query-string';

import { jsx, css } from '@emotion/core';
import styled from '@emotion/styled';

import * as THREE from 'three';

const srcDirectory = '../..';

import {ThreeSceneComp, useThreeCBs} from '../../components/ThreeScene.js';
import ControlBar from '../../components/ControlBar.js';
import Main from '../../components/Main.js';
import FunctionInput from '../../components/FunctionInput.js';
import funcParser from '../../utils/funcParser.js';
import ResetCameraButton from '../../components/ResetCameraButton.js';
import ClickablePlaneComp from '../../components/ClickablePlaneComp.js';
import Input from '../../components/Input.js';
import ArrowGridOptions from '../../components/ArrowGridOptions.js';
import SaveButton from '../../components/SaveButton.js';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.js';
import Button from '../../components/Button.js';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use2DAxes from '../../graphics/use2DAxes.js';
import FunctionGraph2DGeom from '../../graphics/FunctionGraph2DGeom.js';
import ArrowGridGeom from '../../graphics/ArrowGridGeom.js';
import DirectionFieldApproxGeom from '../../graphics/DirectionFieldApprox.js';
import useDraggableMeshArray from '../../graphics/useDraggableMeshArray.js';
import ArrowGeometry from '../../graphics/ArrowGeometry.js';
import CurvedPathGeom from '../../graphics/CurvedPathGeom.js';

import useDebounce from '../../hooks/useDebounce.js';
import useHashLocation from '../../hooks/useHashLocation.js';

import ImplicitFuncGraph, {nextSide, borderingSquare, ptOnSide} from '../../math/ImplicitFuncGraph.js';

import {round} from '../../utils/BaseUtils.js';


//------------------------------------------------------------------------
//
// initial data
//

const fonts = "'Helvetica', 'Hind', sans-serif";
const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    firstPt: '#C2374F',
    secPt: '#C2374F',
    testFunc: '#E16962',//#DBBBB0',
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
    rotation: {order: 'XYZ'},
    orthographic: { left: frustumSize * aspectRatio / -2,
                    right: frustumSize * aspectRatio / 2,
                    top: frustumSize / 2,
                    bottom: frustumSize / -2,
                  }
};

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE}, 
    touches: { ONE: THREE.MOUSE.PAN,
	       TWO: THREE.TOUCH.DOLLY,
	       THREE: THREE.MOUSE.ROTATE },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false};

// percentage of screen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const fontSize = 1;
const controlBarFontSize = 1;

const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color( initColors.solution ),
    side: THREE.FrontSide });

solutionMaterial.transparent = true;
solutionMaterial.opacity = .6;

const solutionCurveRadius = .1;

const pointMaterial = solutionMaterial.clone();
pointMaterial.transparent = false;
pointMaterial.opacity = .8;

const testFuncMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color( initColors.testFunc ),
    side: THREE.FrontSide });

testFuncMaterial.transparent = true;
testFuncMaterial.opacity = .6;

const testFuncRadius = .1;

const testFuncH = .01;

const dragDebounceTime = 5;

const initAxesData = {
    radius: .01,
    show: true,
    showLabels: true,
    labelStyle
};

const initGridData = {
    show: true
};

const funcStr = 
      '(x^2+y^2)^3 - 4*x^2*y^2';


// sombrero
//'3*sin((3.14)*(x^2+y^2)^(1/2))/(3.14*(x^2+y^2)^(1/2))'

//
// 'y*(1-1/(x^2+y^2))'

// shifted circle
//'(x^2+y^2-x)/100-1';

// ampersand curve
// (y^2-x^2)*(x-1)*(2*x-3)-4*(x^2+y^2-2*x)^2


const quadSize = 10;
const initState = {
    bounds: {xMin: -quadSize, xMax: quadSize,
             yMin: -quadSize, yMax: quadSize},
    funcStr,
    func: funcParser(funcStr),
    approxH: 1
};

const roundConst = 3;

function shrinkState({ bounds, funcStr, approxH }) {

    const {xMin, xMax, yMin, yMax} = bounds;
    
    const newObj = { b: [xMin, xMax, yMin, yMax],
                     fs: funcStr,
                     a: approxH};

    return newObj;            
}

// f is a function applied to the string representing each array element

function strArrayToArray( strArray, f = Number ) {

    // e.g., '2,4,-32.13' -> [2, 4, -32.13]

    return strArray.split(',').map( x => f(x) );
}
    

function expandState({ b, fs, a }) {

    const bds = strArrayToArray( b, Number );

    return ({ bounds: {xMin: bds[0], xMax: bds[1], yMin: bds[2], yMax: bds[3]},
              funcStr: fs,
              func: funcParser(fs),
              approxH: Number(a)
            });    
}

const gridBounds = initState.bounds;


//------------------------------------------------------------------------


export default function App() {
         
    const [state, setState] = useState(initState);

    const [showGraph, setShowGraph] = useState(false);
    
    const [graphComps, setGraphComps] = useState(null);    
    
    const [colors,] = useState(initColors);

    const [fontState,] = useState(fonts);

    const [cbhState,] = useState(controlBarHeight);

    const [cbfsState,] = useState(controlBarFontSize);

    const [minuscbhState,] = useState(100-controlBarHeight);
    
    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    

    
    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ threeCBs,
		       bounds: gridBounds,
		       show: initGridData.show,
		       originRadius: .1 });

    use2DAxes({ threeCBs,
                bounds: state.bounds,
                radius: initAxesData.radius,
                color: initColors.axes,
                show: initAxesData.show,
                showLabels: initAxesData.showLabels,
                labelStyle });

    useEffect( () => {
      
        setGraphComps(ImplicitFuncGraph({ func: state.func,
                                          bounds: state.bounds,
                                          approxH: state.approxH })
                      .map( a => a.map( ([x,y]) => new THREE.Vector3(x,y,0) ) ) );

    }, [state.func, state.bounds, state.approxH]);

    useEffect( () => {

        if( !showGraph || !threeCBs || graphComps.length === 0 ) return;

        const geom = CurvedPathGeom({ compArray: graphComps, radius: .02 });

        const mesh = new THREE.Mesh( geom, solutionMaterial );

        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
            
        };
        
    }, [showGraph, graphComps, threeCBs] );

   
    const funcInputCB =  useCallback(
        newFuncStr => {

            setState( ({ funcStr,func, ...rest }) =>
                      ({ funcStr: newFuncStr, func: funcParser(newFuncStr), ...rest }) );

            setShowGraph(false);
        } , [] );

    const buttonCB = useCallback( () => setShowGraph(true), [] );
   
    
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
        alignItems: 'center'});
    
    const css5 = useRef({textAlign: 'center',
                         width: '12em'});

    const css6 = useRef({paddingTop: '.5em'});

    const css7 = useRef({textAlign: 'center'});

    const css8 = useRef({padding: '0em'});

    const css9 = useRef({margin: '0em 2em'});
    
    return (       
        <FullScreenBaseComponent backgroundColor={colors.controlBar}
                                 fonts={fontState}>
          
          <ControlBar height={cbhState} fontSize={fontSize*cbfsState} padding='0em'>
            <div style={css3.current}>
              <div style={css4.current}>
                <div style={css5.current}>
                  Function:
                </div>
                <span style={css6.current}>
                  <Input size={40}
                         initValue={state.funcStr}
                         onC={funcInputCB}/>
                </span>
                <Button userCss={css9.current}
                        onClickFunc={buttonCB}>
                Graph
              </Button>
              </div>
            
            </div>
          </ControlBar>
          
          <Main height={minuscbhState}
                fontSize={fontSize*cbfsState}>
            <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={initControlsData}
            />          
          
          </Main>
          
        </FullScreenBaseComponent>);                              
}


 /* <ResetCameraButton key="resetCameraButton" */
 /*                               onClickFunc={resetCameraCB} */
 /*                               color={controlsEnabled ? initColors.controlBar : null } */
 /*                               userCss={{ top: '85%', */
 /*                                          left: '5%', */
 /*                                          userSelect: 'none'}}/> */
