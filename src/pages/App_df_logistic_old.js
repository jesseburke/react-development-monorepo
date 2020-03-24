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

import {initColors, initArrowGridData, initAxesData,
        initGridData, initControlsData, secControlsData,
        halfXSize, halfYSize, xMin, xMax, initCameraData,
        initFuncStr, initXFuncStr, fonts,
        initYFuncStr} from './constants.js';


//------------------------------------------------------------------------
//
// initial data
//



// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const percControlBar = 1;
const percButton = .85;
const percDrawer = .85;


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


const initAVal = 1;

const initKVal = 1;



//------------------------------------------------------------------------

export default function App() {

    const [arrowGridData, setArrowGridData] = useState( initArrowGridData );    

    const [axesData, setAxesData] = useState( initAxesData );

    const [gridData, setGridData] = useState( initGridData );

    const [controlsData, setControlsData] = useState( initControlsData );

    const [colors, setColors] = useState( initColors );

    const [initialPt, setInitialPt] = useState(null);

    const [approxH, setApproxH] = useState(.1);

    const [testFunc, setTestFunc] = useState(null);

    const [aVal, setAVal] = useState(initAVal);

    const [bVal, setBVal] = useState(initAVal);

    const [kVal, setKVal] = useState(initKVal);

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    
    


    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ gridData, threeCBs, originRadius: .1 });
    use2DAxes({ threeCBs, axesData });

    useEffect( () => {

         setArrowGridData( ({func, ...rest}) =>
                           ({ func: (x,y) => initKVal*y - initAVal*y*y,
                              ...rest}) );
    }, [] );
    

    //------------------------------------------------------------------------
    //
    //arrowGrid effect
    
    useEffect( ()  => {

        if( !threeCBs ) return;

        const arrowGrid = ArrowGrid( arrowGridData );

        threeCBs.add( arrowGrid.getMesh() );
	
        return () => {
            threeCBs.remove( arrowGrid.getMesh() );
            arrowGrid.dispose();
        };
	
    }, [threeCBs, arrowGridData] );
    

    //------------------------------------------------------------------------
    //
    // solution effect

    const clickCB = useCallback( (pt) => {

        if( controlsEnabled ) {

            setInitialPt( s => s );
            return;
        }

        // if user clicks too close to boundary, don't want to deal with it
        if( pt.x > halfXSize - .25 || pt.x < -halfXSize + .25 ) {
            setInitialPt( null );
            return;
        }

        setInitialPt( [pt.x, pt.y] );
        
    }, [controlsEnabled, initialPt] );

    useEffect( () => {

        if( !threeCBs || !initialPt ) return;

        const dfag = DirectionFieldApproxGeom({ func: arrowGridData.func,
                                                initialPt,
                                                h: approxH,
                                                radius: solutionCurveRadius});

        const mesh = new THREE.Mesh( dfag, solutionMaterial );

        threeCBs.add( mesh );

        const ptGeom = new THREE.SphereBufferGeometry( solutionCurveRadius*2, 15, 15 )
              .translate(initialPt[0], initialPt[1], 0);

        const ptMesh = new THREE.Mesh( ptGeom, pointMaterial );
        threeCBs.add( ptMesh );      	

        return () => {
            threeCBs.remove(mesh);
            dfag.dispose();

            threeCBs.remove(ptMesh);
            ptGeom.dispose();
        };

    }, [threeCBs, initialPt, arrowGridData.func, approxH] );
    

    //------------------------------------------------------------------------
    // test graph effect
    
    const testFuncInputCB = useCallback(
        newFunc => {
            setTestFunc( oldFunc => newFunc );
        }, 
        [testFunc]
    );

    
    useEffect( () => {

        if( !threeCBs || !testFunc ) return;

        let pointArray = [];
        
        for( let i = -Math.ceil(halfXSize/testFuncH); i < Math.ceil(halfXSize/testFuncH); i++ ) {

            const t = testFunc( i*testFuncH );

            if( t >= -2*halfYSize && t <= 2*halfYSize ) {
                
                pointArray.push( new THREE.Vector3(i*testFuncH, testFunc( i*testFuncH ), 0) );
            }
        }

        const path = new THREE.CurvePath();

        for( let i = 0; i < pointArray.length-1; i++ ) {

            path.add( new THREE.LineCurve3( pointArray[i], pointArray[i+1] ) );
            
        }

        const geom = new THREE.TubeBufferGeometry( path,
						   1064,
						   testFuncRadius,
						   8,
						   false );
        
        const mesh = new THREE.Mesh( geom, testFuncMaterial );

        threeCBs.add( mesh );

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };

    }, [threeCBs, testFunc] );

    //------------------------------------------------------------------------
    //
    // when sliders change, change the function value

    useEffect( () => {

        setArrowGridData( ({func, ...rest}) =>
                          ({ func: (x,y) => kVal*y - (kVal/bVal)*y*y,
                             ...rest}) );

        //setBVal( kVal/aVal );
        
    }, [bVal, kVal] );

    // useEffect( () => {

    //      setArrowGridData( ({func, ...rest}) =>
    //                        ({ func: (x,y) => kVal*y - aVal*y*y,
    //                           ...rest}) );

    //     //setBVal( kVal/aVal );
        
    // }, [aVal, kVal] );

    // useEffect( () => {

    //     setAVal( kVal/bVal );
        
    // }, [bVal] );

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
          
          <ControlBar height={controlBarHeight} fontSize={initFontSize*percControlBar} padding='.5em'>           

            <div css={{
                margin: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                paddingTop: '.5em',
                paddingBottom: '.5em',
                paddingLeft: '2em',
                paddingRight: '1em',
                borderRight: '1px solid',
                flex: 1
            }}>
              <span css={{textAlign: 'center'}}>             
	        Test Function
              </span>
              <div css={{padding: '0em'}}>
                <FunctionInput onChangeFunc={testFuncInputCB}
                               initFuncStr={''}
                               totalWidth='12em'
                               inputSize={10}
                               leftSideOfEquation={'\u{00177}(x) ='}/>  
              </div>
            </div>

            <div css={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                height: '100%',
                paddingTop: '.5em',
                paddingBottom: '.5em',
                paddingLeft: '1.5em',
                paddingRight: '1.5em',
                borderRight: '1px solid',
                flex: 3,
                width: '30em'                
            }}>
              <span>             
	        dy/dx = k y - a y^2
              </span>

                <div css={{ margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start'}}>
                   <Slider value={aVal}
                    CB={val => setAVal(val)}
                           label={'a'}
                           max={11}
                   />

              <Slider value={kVal}
                    CB={val => setKVal(val)}
                      label={'k'}
                      max={100}
              />

                  <Slider value={bVal}
                    CB={val => setBVal(val)}
                      label={'b'}
                      max={100}
                   />
            </div>
             
            </div>
            
            <ArrowGridOptions userCss={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 7,
                paddingTop: '.5em',
                paddingBottom: '.5em',
                paddingLeft: '1em',
                paddingRight: '2em'}}
                              initDensity={1/arrowGridData.gridSqSize}
                              initLength={arrowGridData.arrowLength}
                              initApproxH={approxH}
                              densityCB={useCallback(
                                  val => setArrowGridData( agd => ({...agd, gridSqSize: Number(1/val)}) ) ,[])}
                              lengthCB={useCallback(
                                  val => setArrowGridData( agd => ({...agd, arrowLength: Number(val)}) ) ,[])}
                              approxHCB={useCallback( val => setApproxH( Number(val) ) ,[])}/>
        
          </ControlBar>
          
          <Main height={100-controlBarHeight}
                fontSize={initFontSize*percDrawer}>
            <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={controlsData}
                            clearColor={initColors.clearColor}
            />
            <ClickablePlaneComp threeCBs={threeCBs}                           
                                clickCB={clickCB}/>
            <ResetCameraButton key="resetCameraButton"
                               onClickFunc={resetCameraCB}
                               color={controlsEnabled ? colors.controlBar : null }
                               userCss={{ top: '85%',
                                          left: '5%',
                                          userSelect: 'none'}}/>         

          </Main>


          
        </FullScreenBaseComponent>);                              
}



const ssd = 1;    // = slider significant digit

function Slider({value, step = .1, CB = () => null, min = 0, max = 10, label='', userCss={}}) {

    
    return (<div style={userCss}>
              <input name="n" type="range" value={value} step={step}
	             onChange={(e) => CB(e.target.value)}
	             min={min} max={max}
              />
              <label htmlFor="range_n">{label}={round(value, ssd)}</label>
            </div>);
}


function round(x, n = 2) {

    // x = -2.336596841557143
    
    return Number(( x * Math.pow(10, n) )/Math.pow(10, n)).toFixed(n); 
    
}

