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

import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use2DAxes from '../../graphics/use2DAxes.js';
import FunctionGraph2DGeom from '../../graphics/FunctionGraph2DGeom.js';
import ArrowGridGeom from '../../graphics/ArrowGridGeom.js';
import DirectionFieldApproxGeom from '../../graphics/DirectionFieldApprox.js';
import useDraggableMeshArray from '../../graphics/useDraggableMeshArray.js';
import ArrowGeometry from '../../graphics/ArrowGeometry.js';

import useDebounce from '../../hooks/useDebounce.js';
import useHashLocation from '../../hooks/useHashLocation.js';

import ImplicitFuncGraph, {nextSide, borderingSquare} from '../../math/ImplicitFuncGraph.js';

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

const funcStr = 'x^6+y^6-x^2';
    
const initState = {
    bounds: {xMin: -20, xMax: 20,
             yMin: -20, yMax: 20},
    funcStr,
    func: funcParser(funcStr),
    approxH: 11
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
         
    const [state, setState] = useState({...initState });  

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

        console.log( ImplicitFuncGraph({ func: state.func, bounds: state.bounds,
                                         approxH: state.approxH }) );

        console.log( borderingSquare( 2, 't' ) );
        
    }, []);

    //------------------------------------------------------------------------
    //
    // look at location.search

    // want to: read in the query string, parse it into an object, merge that object with
    // initState, then set all of the state with that merged object

    useEffect( () => {     

        const qs = window.location.search;

        if( qs.length === 0 ) {

            setState( s => s );
            return;
            
        }

        const newState = queryString.parse(qs.slice(1));
        setState(s => expandState(newState));

        console.log('state is ', state);
        console.log('newState is ', newState);
        console.log('expandState(newState) is ', expandState(newState) );
        

       
        //window.history.replaceState(null, null, '?'+queryString.stringify(state));
        //window.history.replaceState(null, null, "?test");
        
    }, [] );

    const saveButtonCB = useCallback( () => 
        window.history.replaceState(null, null,
                                    '?'+queryString.stringify(shrinkState(state),
                                                              {decode: false,
                                                               arrayFormat: 'comma'}))
                                      ,[state]                                 );
    

      
    const funcInputCB =  useCallback(
        newFuncStr => setState(
            ({ funcStr,func, ...rest }) => ({ funcStr: newFuncStr, func: funcParser(newFuncStr), ...rest }) ), [] );
   
    

   
    const css4 = useRef({
        margin: 0,
        width: '100%',
                position: 'relative',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '0em 2em',
                alignContent: 'center',
                alignItems: 'center',
        borderLeft: '1px solid'}, []);

    const css5 = useRef({textAlign: 'center',
                         width: '12em'}, []);

    const css6 = useRef({paddingTop: '.5em'}, []);

    const css7 = useRef({textAlign: 'center'}, []);

    const css8 = useRef({padding: '0em'}, []);
    
    return (       
        <FullScreenBaseComponent backgroundColor={colors.controlBar}
                                 fonts={fontState}>
          
          <ControlBar height={cbhState} fontSize={fontSize*cbfsState} padding='0em'>
           
            <div style={css4.current}>
              <div style={css5.current}>
                Function:
              </div>
              <span style={css6.current}>
                <Input size={20}
                       initValue={state.funcStr}
                       onC={funcInputCB}/>
              </span>
            </div>
          </ControlBar>
          
          <Main height={minuscbhState}
                fontSize={fontSize*cbfsState}>
            <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={initControlsData}
            />          
            <SaveButton onClickFunc={saveButtonCB}/>

          </Main>
          
        </FullScreenBaseComponent>);                              
}


 /* <ResetCameraButton key="resetCameraButton" */
 /*                               onClickFunc={resetCameraCB} */
 /*                               color={controlsEnabled ? initColors.controlBar : null } */
 /*                               userCss={{ top: '85%', */
 /*                                          left: '5%', */
 /*                                          userSelect: 'none'}}/> */
