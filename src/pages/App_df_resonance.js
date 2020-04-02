import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import * as THREE from 'three';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import ControlBar from '../components/ControlBar.js';
import Main from '../components/Main.js';
import funcParser from '../utils/funcParser.js';
import Input from '../components/Input.js';
import Slider from '../components/Slider.js';
import TexDisplayComp from '../components/TexDisplayComp.js';
import InitialCondsComp from '../components/InitialCondsComp.js';

import useGridAndOrigin from '../graphics/useGridAndOriginNew.js';
import use2DAxes from '../graphics/use2DAxes.js';
import FunctionGraph2DGeom from '../graphics/FunctionGraph2DGeom.js';
import useDraggableMeshArray from '../graphics/useDraggableMeshArray.js';

import useDebounce from '../hooks/useDebounce.js';

import {processNum} from '../utils/BaseUtils.js';

import {solnStrs} from '../math/differentialEquations/secOrderConstantCoeff.js';

import {fonts, labelStyle} from './constants.js';


//------------------------------------------------------------------------
//
// initial data
//

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

const xMin = -50, xMax = 50;
const yMin = -50, yMax = 50;
const bounds = {xMin, xMax, yMin, yMax};

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
    mouseButtons: { LEFT: THREE.MOUSE.PAN}, 
    touches: { ONE: THREE.MOUSE.PAN,
	       TWO: THREE.TOUCH.DOLLY,
	       THREE: THREE.MOUSE.ROTATE },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false};

const initAxesData = {
    radius: .01,
    color: initColors.axes,
    tickDistance: 1,
    tickRadius: 3.5,      
    show: true,
    showLabels: true,
    labelStyle
};

const initGridData = {
    show: true,
    originColor: 0x3F405C
};


// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 15;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = .85;


const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color( initColors.solution ),
    side: THREE.FrontSide });

solutionMaterial.transparent = true;
solutionMaterial.opacity = .6;

const solutionCurveRadius = .05;

const pointMaterial = solutionMaterial.clone();
pointMaterial.transparent = false;
pointMaterial.opacity = .8;

const testFuncMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color( initColors.testFunc ),
    side: THREE.FrontSide });

//testFuncMaterial.transparent = true;
//testFuncMaterial.opacity = .6;

const solnRadius = .2;
const solnH = .1;

const initW0Val = 4.8;
const initWVal = 4.83;
const initFVal = 9.5;

const fMin = .1;
const fMax = 10;
const w0Min = .1;
const w0Max = 10;
const wMin = .1;
const wMax = 10;

const step = .01;


const initApproxHValue = .01;

const resonanceEqTex = "\\ddot{y} + \\omega_0^2 y = f \\cos( \\omega t )";
const initialCondsTex = "y(0) = 0, \\, \\, \\dot{y}(0) = 0";

const initInitConds = [[4,7], [7,5]];

const initialPointMeshRadius = .4;

const debounceTime = 10;

const initSigDig = 3;

const initPrecision = 4;
const precision = initPrecision;
const initCondsPrecision = 4;
const sliderPrecision = 3;


//------------------------------------------------------------------------

export default function App() {
   
    const [fVal, setFVal] = useState(processNum(initFVal, precision));

    const [wVal, setWVal] = useState(processNum(initWVal, precision));

    const [w0Val, setW0Val] = useState(processNum(initW0Val, precision));

    const [func, setFunc] = useState(null);

    const [solnStr, setSolnStr] = useState(null);

    const [solnTexStr, setSolnTexStr] = useState(null);

    const [sigDig, setSigDig] = useState(initSigDig);

    const [precision, setPrecision] = useState(initPrecision);    

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    
    
    // expects object with 'str' field
    const num = x => Number.parseFloat(x.str);

    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ threeCBs,
		       bounds,
		       show: initGridData.show,
		       originColor: initGridData.originColor,
		       originRadius: .1 });

    use2DAxes({ threeCBs,
                bounds,
                radius: initAxesData.radius,
                color: initAxesData.color,
                show: initAxesData.show,
                showLabels: initAxesData.showLabels,
                labelStyle,
                xLabel: 't' });

    const dbFVal = useDebounce(fVal, debounceTime);
    const dbWVal = useDebounce(wVal, debounceTime);
    const dbW0Val = useDebounce(w0Val, debounceTime);

     //------------------------------------------------------------------------
    //
    // initialize function state

    
    useEffect( () => {

        const f = num(dbFVal);
        const w = num(dbWVal);
        const w0 = num(dbW0Val);

        const C = f/(w0*w0 - w*w);

        setFunc({ func: (t) => C*(Math.cos(w*t) - Math.cos(w0*t)) });

    }, [dbFVal, dbWVal, dbW0Val] );

    //  useEffect( () => {

    //     const f = num(fVal);
    //     const w = num(wVal);
    //     const w0 = num(w0Val);

    //     const C = f/(w0*w0 - w*w);

    //     setFunc({ func: (t) => C*(Math.cos(w*t) - Math.cos(w0*t)) });

    // }, [fVal, wVal, w0Val] );
      

       

    //------------------------------------------------------------------------
    //
    // solution display effect

    useEffect( () => {

        if( !threeCBs || !func ) return;
        
        const geom = FunctionGraph2DGeom({ func: func.func,
                                           bounds,
                                           maxSegLength: 40,
                                           approxH: .05,
                                           radius: .05,
                                           tubularSegments: 1064 });

        
        const mesh = new THREE.Mesh( geom, testFuncMaterial );

        threeCBs.add( mesh );	

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
        
    }, [threeCBs, bounds, func] );
    
    
    return (       
        <FullScreenBaseComponent backgroundColor={initColors.controlBar}
                                 fonts={fonts}>
          
          <ControlBar height={controlBarHeight}
                      fontSize={initFontSize*controlBarFontSize}
                      padding='0em'>           

            <div css={{
                margin: 0,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: '100%',
                padding: '.5em',
                fontSize: '1.25em',
                flex: 5
            }}>
              
              <div  css={{
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1em 2em'}}
              >               
                <div css={{whiteSpace: 'nowrap',
                           marginBottom: '1.5em'}}>
                  <TexDisplayComp userCss={{padding:'.25em 0'}}
                                  str={resonanceEqTex}
                  />
                </div>
                <div css={{whiteSpace: 'nowrap'}}>
                  <TexDisplayComp userCss={{padding:'.25em 0'}}
                                  str={initialCondsTex}
                  />
                </div>
              </div>          

               <div  css={{
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',               
                  padding: '1em 2em'}}
              >            
                
                <div css={{padding:'.25em 0',
                           textAlign: 'center'}}>
                  <TexDisplayComp userCss={{padding:'.25em 0'}}
                                  str={`\\frac{f}{\\omega_0^2 - \\omega^2} = ${processNum(Number.parseFloat(fVal.str)/(Number.parseFloat(w0Val.str)*Number.parseFloat(w0Val.str) - Number.parseFloat(wVal.str)*Number.parseFloat(wVal.str)), precision).texStr}`}
                  />               
                </div>
                <div css={{
                    padding: '.5em 0',
                    fontSize: '1.00em',
                    whiteSpace: 'nowrap'
                }}>
                  <TexDisplayComp userCss={{padding:'.25em 0'}}
                     str={`y=${processNum(num(fVal)/(num(w0Val)**2 - num(wVal)**2), precision).texStr}( \\cos(${num(wVal)}t) - \\cos(${num(w0Val)}t))`}
                  />       
                </div>
               </div>

                   <div  css={{
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',                  
                  padding: '1em 2em'}}
              >            
                <Slider
                  userCss={{padding: '.25em 0em'}}
                  value={Number.parseFloat(w0Val.str)}
                  CB={val =>
                      setW0Val(processNum(Number.parseFloat(val), precision))}
                  label={'w0'}                  
                  max={w0Max}
                  min={w0Min}
                  step={step}
                  precision={sliderPrecision}
                />

                <Slider
                  userCss={{padding: '.25em 0em'}}
                  value={Number.parseFloat(wVal.str)}
                  CB={val =>
                      setWVal(processNum(Number.parseFloat(val), precision))}
                  label={'w'}
                  min={wMin}
                  max={wMax}
                  step={step}
                  precision={sliderPrecision}
                />
                 <Slider
                   userCss={{padding: '.25em 0em'}}
                   value={Number.parseFloat(fVal.str)}
                   CB={val =>
                       setFVal(processNum(Number.parseFloat(val), precision))}
                   label={'f'}
                   min={fMin}
                   max={fMax}
                   step={step}
                   precision={sliderPrecision}
                 />                
               </div>

            </div>

         
          </ControlBar>
          
          <Main height={100-controlBarHeight}
                fontSize={initFontSize*controlBarFontSize}>
            <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={initControlsData}
                            clearColor={initColors.clearColor}
            />           

          </Main>
          
        </FullScreenBaseComponent>);                              
}


