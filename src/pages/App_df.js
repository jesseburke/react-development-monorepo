import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import * as THREE from 'three';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';
import {Button} from '@jesseburke/basic-react-components';
import {Modal} from '@jesseburke/basic-react-components';
import {ConditionalDisplay} from '@jesseburke/basic-react-components';

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
        bounds, initCameraData,
        initFuncStr, initXFuncStr, fonts,
        initYFuncStr} from './constants.js';

import katex from 'katex';
import 'katex/dist/katex.min.css';

//------------------------------------------------------------------------
//
// initial data
//

const {xMin, xMax, yMin, yMax} = bounds;

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 1;


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

const initApproxHValue = .01;

const LatexEquation = "\\frac{dy}{dx} = ";


//------------------------------------------------------------------------

export default function App() {   

    const [arrowGridData, setArrowGridData] = useState( initArrowGridData );    

    const [axesData, setAxesData] = useState( initAxesData );

    const [gridData, setGridData] = useState( initGridData );

    const [controlsData, setControlsData] = useState( initControlsData );

    const [colors, setColors] = useState( initColors );

    const [initialPt, setInitialPt] = useState(null);

    const [approxH, setApproxH] = useState(initApproxHValue);

    const [testFunc, setTestFunc] = useState(null);

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    


    const funcInputCallback = useCallback(
        newFunc => setArrowGridData( ({func,...rest}) => ({func: newFunc, ...rest}) ),
        [] );



    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ gridData, threeCBs, originRadius: .1 });
    use2DAxes({ threeCBs, axesData });

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
        if( pt.x > xMax - .25 || pt.x < xMin + .25 ) {
            setInitialPt( null );
            return;
        }

        setInitialPt( [pt.x, pt.y] );
        
    }, [controlsEnabled] );

    useEffect( () => {

        if( !threeCBs || !initialPt ) return;

        const dfag = DirectionFieldApproxGeom({ func: arrowGridData.func,
                                                initialPt,
                                                bounds,
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

    }, [threeCBs, initialPt, bounds, arrowGridData.func, approxH] );
    
    
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
        
        for( let i = Math.floor(xMin/testFuncH); i < Math.ceil(xMax/testFuncH); i++ ) {

            const t = testFunc( i*testFuncH );

            if( t >= 2*yMin && t <= 2*yMax ) {
                
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

    }, [threeCBs, testFunc, xMin, xMax, yMin, yMax] );

    
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
          
          <ControlBar height={controlBarHeight} fontSize={initFontSize*controlBarFontSize} padding='0em'>
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
                paddingRight: '1em',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                borderRight: '1px solid'}}>             
	      <FunctionInput onChangeFunc={funcInputCallback}
                             initFuncStr={initFuncStr}
                             leftSideOfEquation="dy/dx ="/>  
            </div>
           

            <ArrowGridOptions
              userCss={{
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
                fontSize={initFontSize*controlBarFontSize}>
            <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={controlsData}
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

