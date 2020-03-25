import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import * as THREE from 'three';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';
import {Button} from '@jesseburke/basic-react-components';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import ControlBar from '../components/ControlBar.js';
import Main from '../components/Main.js';
import FunctionInput from '../components/FunctionInput.js';
import funcParser from '../utils/funcParser.js';
import ResetCameraButton from '../components/ResetCameraButton.js';
import ClickablePlaneComp from '../components/ClickablePlaneComp.js';
import Input from '../components/Input.js';
import ArrowGridOptions from '../components/ArrowGridOptions.js';

import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';
import use3DAxes from '../graphics/use3DAxes.js';
import FunctionGraph from '../graphics/FunctionGraph.js';
import ArrowGrid from '../graphics/ArrowGrid.js';
import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.js';
import ArrowGeometry from '../graphics/ArrowGeometry.js';

import MatrixFactory from '../math/MatrixFactory.js';

import {initArrowGridData, initAxesData,
        initGridData, initControlsData, secControlsData,
        bounds, initCameraData,
        initFuncStr, initXFuncStr, fonts,
        initYFuncStr} from './constants.js';

import katex from 'katex';
import 'katex/dist/katex.min.css';




//------------------------------------------------------------------------
//
// initial data
//

export const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    firstPt: '#C2374F',
    secPt: '#E16962',
    testFunc: '#E16962',//#DBBBB0',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0'
};


const {xMin, xMax, yMin, yMax} = bounds;

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

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

testFuncMaterial.transparent = true;
testFuncMaterial.opacity = .6;

const testFuncRadius = .05;

const testFuncH = .1;

const capacityMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color( initColors.testFunc ),
    side: THREE.FrontSide });

capacityMaterial.transparent = true;
capacityMaterial.opacity = .4;


const initAVal = 4;

const initBVal = 1;

const initApproxHValue = .01;

const LatexSecOrderEquation = "(\\frac{d}{dx})^2(y) + a \\cdot \\frac{d}{dx}(y) + b \\cdot y  = 0";//"\\frac{d^2y}{dx^2} + a \\cdot \\frac{dy}{dx} + b \\cdot y  = 0";

const initInitConds = [[1,0], [1,1]];

//------------------------------------------------------------------------

export default function App() {

    const [arrowGridData, setArrowGridData] = useState( initArrowGridData );    

    const [axesData, setAxesData] = useState( initAxesData );

    const [gridData, setGridData] = useState( initGridData );

    const [controlsData, setControlsData] = useState( initControlsData );

    const [colors, setColors] = useState( initColors );

    const [initialConds, setInitialConds] = useState(initInitConds); 

    const [aVal, setAVal] = useState(initAVal);

    const [bVal, setBVal] = useState(initBVal);

    const [aSliderMax, setASliderMax] = useState(30);

    const [solnStr, setSolnStr] = useState(null);

    const [sigDig, setSigDig] = useState(1);    

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    
    


    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ gridData, threeCBs, originRadius: .1
                     });
    use2DAxes({ threeCBs, axesData });

  

    //------------------------------------------------------------------------
    //
    // effect to make camera look at median point

    useEffect( () => {

        if( !threeCBs ) return;

        //threeCBs.setCameraLookAt([(xMax+xMin)/2,(yMin+yMax)/2,0]);
        //console.log('set camera to look at: ', [(xMax+xMin)/2,(yMin+yMax)/2,0]);
        
    }, [threeCBs] );

    
    //------------------------------------------------------------------------
    //
    // when initialConds change, change the displayed points

    useEffect( () => {

        if( !threeCBs ) return;

        const radius = .2;

        const geometry1 = new THREE.SphereBufferGeometry( radius, 15, 15 );
        const material1 = new THREE.MeshBasicMaterial({ color: initColors.firstPt });

        const mesh1 = new THREE.Mesh( geometry1, material1 )
              .translateX(initialConds[0][0])
              .translateY(initialConds[0][1]);

        threeCBs.add( mesh1 );
        //console.log('effect based on initialConds called');

        const geometry2 = new THREE.SphereBufferGeometry( radius, 15, 15 );
        const material2 = new THREE.MeshBasicMaterial({ color: initColors.secPt });

        const mesh2 = new THREE.Mesh( geometry2, material2 )
              .translateX(initialConds[1][0])
              .translateY(initialConds[1][1]);

        threeCBs.add( mesh2 );

        return () => {

            if( mesh1 ) threeCBs.remove(mesh1);
            geometry1.dispose();
            material1.dispose();

            if( mesh2 ) threeCBs.remove(mesh2);
            geometry2.dispose();
            material2.dispose();
            
        };
        
        
    }, [threeCBs, initialConds] );
    
       
    
    //------------------------------------------------------------------------
    //
    // 
    

    useEffect( () => {

        const c = calcSolnStr( aVal, bVal, initialConds, sigDig+1 ) ;
        console.log(c);
        setSolnStr( c );
       
    }, [aVal, bVal, initialConds, sigDig] );


    //------------------------------------------------------------------------
    //
    
    const resetCameraCB = useCallback( () => {

        if( controlsEnabled ) {
            setControlsEnabled(false);  
            threeCBs.setCameraPosition( initCameraData.position, initCameraData.up );
            threeCBs.resetControls();
            threeCBs.changeControls( initControlsData );
        }

        else {
            setControlsEnabled(true);
            //threeCBs.resetControls();
            threeCBs.changeControls( secControlsData );
        }
        
    }, [controlsEnabled, threeCBs] );
    
    
    return (       
        <FullScreenBaseComponent backgroundColor={colors.controlBar}
                                 fonts={fonts}>
          
          <ControlBar height={controlBarHeight}
                      fontSize={initFontSize*controlBarFontSize}
                      padding='.5em'>           

            <div css={{
                margin: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                padding: '.5em 1em',
                fontSize: '1.25em',
                borderRight: '1px solid',
                flex: 5
            }}>
              
              <div  css={{
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '0em 3em'}}>
                <div css={{padding:'.25em 0',
                           textAlign: 'center'}}>
                  2nd order linear, w/ constant coefficients
                </div>
               <span css={{padding:'.25em 0'}}
                     dangerouslySetInnerHTML={{ __html: katex.renderToString(LatexSecOrderEquation) }}
                />
              </div>

              <div css={{ margin: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'flex-start',
                          padding: '0em 2em'}}>
                <Slider
                  userCss={{padding: '.25em 0em'}}
                  value={aVal}
                  CB={val => setAVal(val)}
                  label={'a'}
                  max={xMax}
                  min={0}
                />

                <Slider
                  userCss={{padding: '.25em 0em'}}
                  value={bVal}
                  CB={val => setBVal(val)}
                  label={'b'}
                  max={aVal*yMax}
                />                
              </div>
            </div>

            <div  css={{
                 margin: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                padding: '.5em 1em',
                fontSize: '1.25em',
                borderRight: '1px solid'}}>
              <div css={{padding:'.25em 0',
                         textAlign: 'center'}}>
                <span css={{padding:'.25em 0'}}
                      dangerouslySetInnerHTML={{ __html: katex.renderToString(
                          `a^2 - 4b = ${round(aVal*aVal - 4*bVal,sigDig+1).toString()}`) }}
                />               
              </div>                            
            </div>
            <InitialCondsComp initialConds={initialConds}
                              changeCB={useCallback( ic => setInitialConds(ic))}/>
           
          </ControlBar>
          
          <Main height={100-controlBarHeight}
                fontSize={initFontSize*controlBarFontSize}>
            <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={controlsData}
                            clearColor={initColors.clearColor}
            />           
            <ResetCameraButton key="resetCameraButton"
                               onClickFunc={resetCameraCB}
                               color={controlsEnabled ? colors.controlBar : null }
                               userCss={{ top: '85%',
                                          left: '5%',
                                          userSelect: 'none'}}/>         

          </Main>
          
        </FullScreenBaseComponent>);                              
}


// a,b are numbers, initialConds is a 2 elt array of 2 elt arrays
function calcSolnStr(a, b, initialConds, sigDig) {

    const [[x0, y0], [x1, y1]] = initialConds;

    if( a*a - 4*b < 0 ) {

        return null;
    }

    else if( a*a - 4*b > 0 ) {

        // in this case solns have form y = Ce^{m1 * x} + De^{m2 * x}

        const sr = Math.sqrt( a*a - 4*b );

        let m1 = (-a + sr)/2;
        let m2 = (-a - sr)/2;

        const A = [[ Math.E**( m1 * x0), Math.E**( m2 * x0 ), y0 ],
                   [ m1*Math.E**( m1 * x1), m2*Math.E**( m2 * x1 ), y1 ]];

        // putting A in rref will allow us to find C,D
        
        const m = MatrixFactory( A ).rref().getArray();
        const C = round(m[0][2], sigDig);
        const D = round(m[1][2], sigDig);

        m1 = round( m1, sigDig );
        m2 = round( m2, sigDig );
        
        return `y = ${C}*e^(${m1}*x) + ${D}*e^(${m2}*x)`;
        
    }

    
}

function InitialCondsComp({ initialConds=[[1,0],[1,1]], changeCB = () => null}) {

    const [firstPt, setFirstPt] = useState(initialConds[0]);
    const [secPt, setSecPt] = useState(initialConds[1]);

    useEffect( () => {

        changeCB([ firstPt, secPt ]);
        //console.log('effect inside initialCondsComp called');
        
    }, [firstPt, secPt] );

    return (
        <div css={{
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '.5em 1em',
            fontSize: '1.25em'
        }}>

          <div css={{padding: '0 1em'}}>Initial Conditions</div>

          <div css={{ margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      padding: '0em 1em'}}>
            <div css={{padding: '.25em 0'}}>
              <span>y(</span>
              <Input initValue={firstPt[0]}
                     onC={useCallback( val => setFirstPt( pt => [Number(val), pt[1]] ) )}
                     size={4}/> <span>) = </span>
              <Input initValue={firstPt[1]}
                     onC={useCallback( val => setFirstPt( pt => [pt[0], Number(val)] ) )}
                     size={4}/>
            </div>
             <div css={{padding: '.25em 0'}}>
              <span>y'(</span>
               <Input initValue={secPt[0]}
                      onC={useCallback( val => setSecPt( pt => [Number(val), pt[1]] ) )}
                      size={4}/>
               <span>) = </span>
               <Input initValue={secPt[1]}
                      onC={useCallback( val => setSecPt( pt => [pt[0], Number(val)] ) )}
                      size={4}/>
            </div>
          </div>
        </div>
    );        
}

function Slider({value,
                 step = .1,
                 CB = () => null,
                 sigDig = 1,
                 min = 0,
                 max = 10,
                 label='',
                 userCss={}}) {

    
    return (<div style={userCss}>
            <input name="n" type="range" value={value} step={step}
	           onChange={(e) => CB(e.target.value)}
	           min={min} max={max}
            />
              <label  css={{padding: '0em .5em',
                            whiteSpace: 'nowrap'}}
                    htmlFor="range_n">{label + ' = ' + round(value, sigDig).toString()}</label>
          </div>);
}


function round(x, n = 2) {

    // x = -2.336596841557143
    
    return Number(( x * Math.pow(10, n) )/Math.pow(10, n)).toFixed(n); 
    
}

