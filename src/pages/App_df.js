import React, { useState, useRef, useEffect, useCallback } from 'react';

import queryString from 'query-string';

import { jsx } from '@emotion/core';

import * as THREE from 'three';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';

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
import FunctionGraph2DGeom from '../graphics/FunctionGraph2DGeom.js';
import ArrowGridGeom from '../graphics/ArrowGridGeom.js';
import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.js';
import useDraggableMeshArray from '../graphics/useDraggableMeshArray.js';
import ArrowGeometry from '../graphics/ArrowGeometry.js';

import useDebounce from '../hooks/useDebounce.js';
import useHashLocation from '../hooks/useHashLocation.js';

import {fonts, labelStyle} from './constants.js';


//------------------------------------------------------------------------
//
// initial data
//


const initState = {
    xMin: -20, xMax: 20,
    yMin: -20, yMax: 20,
    arrowDensity: 1,
    arrowLength: .7,
    funcStr: 'x*y*sin(x+y)/10',
    testFuncStr: 'sin(x)+2.5*sin(5*x)',
    initialPt: [2,2],
    approxHValue: .1
};

const initBounds = {xMin: initState.xMin,
                    xMax: initState.xMax,
                    yMin: initState.yMin,
                    yMax: initState.yMax};

const {xMin, xMax, yMin, yMax} = initBounds;

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

const initGridData = {
    show: true
};

const initAxesData = {
    radius: .01,
    color: initColors.axes,
    show: true,
    showLabels: true,
    labelStyle
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

const secControlsData =  {       
    mouseButtons: {LEFT: THREE.MOUSE.ROTATE}, 
    touches: { ONE: THREE.MOUSE.ROTATE,
	       TWO: THREE.TOUCH.DOLLY,
               THREE: THREE.MOUSE.PAN},
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    zoomSpeed: 1.25};

// percentage of screen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const fontSize = 1;
const controlBarFontSize = 1;

const gridBounds = { xMin, xMax, yMin: xMin, yMax: xMax };

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

const testFuncH = .1;

const dragDebounceTime = 5;


//------------------------------------------------------------------------


export default function App() {   

    const [bounds, setBounds] = useState(initBounds);

    const [func, setFunc] = useState({ func: funcParser(initState.funcStr) });

    const [initialPt, setInitialPt] = useState(initState.initialPt);

    const [approxH, setApproxH] = useState(initState.approxHValue);

    const [arrowGridData, setArrowGridData] = useState({
        arrowDensity: initState.arrowDensity,
        //gridSqSize: 1/initState.arrowDensity,
        arrowLength: initState.arrowLength });

    const [testFunc, setTestFunc] = useState({ func: funcParser(initState.testFuncStr) });

    //

    const [meshArray, setMeshArray] = useState(null);
    
    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    

    
    //------------------------------------------------------------------------
    //
    // initial effects

    const dbInitialPt = useDebounce( initialPt, dragDebounceTime );

    useGridAndOrigin({ threeCBs,
		       bounds: gridBounds,
		       show: initGridData.show,
		       originRadius: .1 });

    use2DAxes({ threeCBs,
                bounds: bounds,
                radius: initAxesData.radius,
                color: initAxesData.color,
                show: initAxesData.show,
                showLabels: initAxesData.showLabels,
                labelStyle,
                xLabel: 't' });

    //------------------------------------------------------------------------
    //
    // look at location.search

    useEffect( () => {

        console.log('length of location.search is ', window.location.search.length );
        console.log(queryString.parse(window.location.search));

        //location.search = queryString.stringify({ test: 12, again: 'asdf' });
        window.history.replaceState(null, null, "?test")
        
    }, [] );
   


    //-------------------------------------------------------------------------
    //
    // make the mesh for the initial point
    
    useEffect( () => {

        if( !threeCBs ) return;

        const geometry = new THREE.SphereBufferGeometry( solutionCurveRadius*2, 15, 15 );
        const material = new THREE.MeshBasicMaterial({ color: initColors.solution });

        const mesh = new THREE.Mesh( geometry, material )
              .translateX(initState.initialPt[0])
              .translateY(initState.initialPt[1]);

        threeCBs.add( mesh );
        setMeshArray([ mesh ]);

        return () => {

            if( mesh ) threeCBs.remove(mesh);
            geometry.dispose();
            material.dispose();
            
        };
        
        
    }, [threeCBs] );
    
   
    //
    // make initial condition point draggable

    // in this case there is no argument, because we know what is being dragged
    const dragCB = useCallback( () => {

        const vec = new THREE.Vector3();

        // this will be where new position is stored
        meshArray[0].getWorldPosition(vec);
        
        setInitialPt(
            [vec.x, vec.y]
        );
        
    }, [meshArray]);

    
    useDraggableMeshArray({ meshArray, threeCBs, dragCB, dragendCB: dragCB });

    // change initial point mesh if initialPoint changes

    useEffect( () => {

        if( !threeCBs ) return;
        
        if( !meshArray || !dbInitialPt) return;

        let vec = new THREE.Vector3();

        meshArray[0].getWorldPosition(vec);

        const [d1, e1] = [ vec.x - dbInitialPt[0] ,  vec.y - dbInitialPt[1] ];

        if( d1 != 0 ) {
            meshArray[0].translateX( -d1 );
        }
        if( e1 != 0 ) {
            meshArray[0].translateY( -e1 );
        }      
        
    }, [threeCBs, meshArray, dbInitialPt] );
    
    

     //------------------------------------------------------------------------
    //
    // solution effect

     const funcInputCallback = useCallback(
        newFunc => setFunc({ func: newFunc }), [] );    

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

        if( !threeCBs || !dbInitialPt ) return;

        const dfag = DirectionFieldApproxGeom({ func: func.func,
                                                initialPt: dbInitialPt,
                                                bounds,
                                                h: approxH,
                                                radius: solutionCurveRadius});

        const mesh = new THREE.Mesh( dfag, solutionMaterial );

        threeCBs.add( mesh );


        return () => {
            threeCBs.remove(mesh);
            dfag.dispose();
        };

    }, [threeCBs, dbInitialPt, bounds, func, approxH] );

    
    //------------------------------------------------------------------------
    //
    //arrowGrid effect
    
    useEffect( ()  => {

        if( !threeCBs ) return;

        const geom = ArrowGridGeom({ arrowDensity: arrowGridData.arrowDensity,
                                     arrowLength: arrowGridData.arrowLength,
                                     bounds,
                                     func: func.func });

        const material = new THREE.MeshBasicMaterial({ color: initColors.arrows });
        //material.transparent = true;
        //material.opacity = .75;
    
        const mesh = new THREE.Mesh(geom, material);
        
        threeCBs.add( mesh );
	
        return () => {
            threeCBs.remove( mesh );
            geom.dispose();
            material.dispose();            
        };
	
    }, [threeCBs, arrowGridData, bounds, func] );
    

     //------------------------------------------------------------------------
    //
    // test graph effect
    
    const testFuncInputCB = useCallback(
        newFunc => {
            setTestFunc({ func: newFunc });
        }, 
        [testFunc]
    );

    
    useEffect( () => {

        if( !threeCBs || !testFunc ) return;
       
        const geom = FunctionGraph2DGeom({ func: testFunc.func, bounds, radius: testFuncRadius });           
        
        const mesh = new THREE.Mesh( geom, testFuncMaterial );

        threeCBs.add( mesh );

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };

    }, [threeCBs, testFunc, bounds] );

    
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
        <FullScreenBaseComponent backgroundColor={initColors.controlBar}
                                 fonts={fonts}>
          
          <ControlBar height={controlBarHeight} fontSize={fontSize*controlBarFontSize} padding='0em'>
               <div css={{
                margin: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                padding: '.5em 2.5em',
                borderRight: '1px solid',
                flex: 1
            }}>
              <span css={{textAlign: 'center'}}>             
	        Test Function
              </span>
              <div css={{padding: '0em'}}>
                <FunctionInput onChangeFunc={testFuncInputCB}
                               initFuncStr={initState.testFuncStr}
                               totalWidth='12em'
                               inputSize={16}
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
                             initFuncStr={initState.funcStr}
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
              initDensity={arrowGridData.arrowDensity}
              initLength={arrowGridData.arrowLength}
              densityCB={useCallback(
                  val => setArrowGridData( agd => ({...agd, gridSqSize: Number(1/val)}) ) ,[])}
              lengthCB={useCallback(
                  val => setArrowGridData( agd => ({...agd, arrowLength: Number(val)}) ) ,[])}
            />
            <div  css={{
                margin: 0,
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column' ,
                justifyContent: 'center',
                padding: '0em 2em',
                alignContent: 'center',
                alignItems: 'center',
                borderLeft: '1px solid'}}>
              <div css={{textAlign: 'center',
                         width: '12em'}}>
                Solution approximation constant:
              </div>
              <span css={{paddingTop: '.5em'}}>
                <Input size={4}
                       initValue={approxH}
                       onC={useCallback( val => setApproxH( Number(val) ) ,[])}/>
              </span>
              </div>
          </ControlBar>
          
          <Main height={100-controlBarHeight}
                fontSize={fontSize*controlBarFontSize}>
            <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={initControlsData}
            />
            <ClickablePlaneComp threeCBs={threeCBs}                           
                                clickCB={clickCB}/>              

          </Main>
          
        </FullScreenBaseComponent>);                              
}

 /* <ResetCameraButton key="resetCameraButton" */
 /*                               onClickFunc={resetCameraCB} */
 /*                               color={controlsEnabled ? initColors.controlBar : null } */
 /*                               userCss={{ top: '85%', */
 /*                                          left: '5%', */
 /*                                          userSelect: 'none'}}/> */
