import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import Delaunator from 'delaunator';


import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import ControlBar from '../components/ControlBar.js';
import Main from '../components/Main.js';
import FunctionInput from '../components/FunctionInput.js';
import funcParser from '../utils/funcParser.js';
import FunctionOptions from '../components/FunctionOptions.js';
import CoordinateOptions from '../components/CoordinateOptions.js';
import CameraOptions from '../components/CameraOptions.js';
import ResetCameraButton from '../components/ResetCameraButton.js';
import RightDrawer from '../components/RightDrawer.js';
import ClickablePlaneComp from '../components/ClickablePlaneComp.js';
import Input from '../components/Input.js';
import FullScreenBaseComponent from '../components/FullScreenBaseComponent.js';

import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';
import FunctionGraph from '../graphics/FunctionGraph.js';
import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.js';
import DelaunayGeometry from '../graphics/DelaunayGeometry.js';

import {RK4Pts} from '../math/differentialEquations/RK4.js';
import PriorityQueueFactory from '../utils/PriorityQueueFactory.js';
import Streamlines from '../math/differentialEquations/Streamlines.js';


import {fonts, labelStyle} from './constants.js';

import katex from 'katex';
import 'katex/dist/katex.min.css';

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


// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const controlBarFontSize = 1;


const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color( initColors.arrows ),
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
testFuncMaterial.opacity = .8;

const testFuncRadius = .05;

const testFuncH = .1;

const initAxesData = {
    radius: .01,
    show: true,
    showLabels: true,
    labelStyle
};

const initGridData = {
    show: true
};



const funcStr = 'x*y*sin(x+y)/10';
const testFuncStr = 'sin(2*x)+1.5*sin(x)';        
    
const initState = {
    bounds: {xMin: -20, xMax: 20,
             yMin: -20, yMax: 20},
    arrowDensity: 1,
    arrowLength: .7,
    funcStr,
    func: funcParser(funcStr),
    testFuncStr,
    testFunc: funcParser(testFuncStr),
    initialPt: [2,2],
    approxH: .1
};

// constants for the Stream Line display
const SLseparatingDistance = 1;
const SLdensity = 1/SLseparatingDistance;
const SLsaturation = 1.6;

const slRadius = .05;

const startingPt = [0,0];

const initApproxH = .1;
const initSepDist = .4;

//------------------------------------------------------------------------

export default function App() {   

    const [arrowGridData, setArrowGridData] = useState( initArrowGridData );

    const [func, setFunc] = useState({ func: initFunc });

    const [axesData, setAxesData] = useState( initAxesData );

    const [gridData, setGridData] = useState( initGridData );

    const [controlsData, setControlsData] = useState( initControlsData );

    const [initialPt, setInitialPt] = useState([0,0]);

    const [approxH, setApproxH] = useState( initApproxH );  

    const [triangulation, setTriangulation] = useState(null);

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const [streamlines, setStreamlines] = useState(null);

    //------------------------------------------------------------------------
    
    const threeSceneRef = useRef(null);
    const threeCBs = useThreeCBs( threeSceneRef );    


    //------------------------------------------------------------------------
    //
    // initial effects
    
    useGridAndOrigin({ gridData, threeCBs, originRadius: .1 });   
    use2DAxes({ threeCBs, axesData });

    
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

        const dfag = DirectionFieldApproxGeom({ func: func.func,
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

    }, [threeCBs, initialPt, bounds, func, approxH] );
    

    //------------------------------------------------------------------------
    //
    // experimenting with streamlines...

    useEffect( () => {

        if( !func ) return;

        setStreamlines(Streamlines({ func: func.func,
                                     initialPt,
                                     bounds,
                                     sepDist: initSepDist,
                                     h: approxH }) );

    }, [func, initialPt, bounds, approxH] );

    
    useEffect( () => {

        if( !threeCBs || (streamlines.curveArray.length === 0) )
            return;

        const geomArray = streamlines.curveArray.map( curve => {

            const curvePointArray = curve.map( ([x,y]) => new THREE.Vector3(x,y,0) );
            
            const path = new THREE.CurvePath();

            for( let i = 0; i < curvePointArray.length - 1; i++ ) {
                path.add( new THREE.LineCurve3( curvePointArray[i], curvePointArray[i+1] ) );
            }

            let geom;

            if ( path.curves.length === 0 ) {

    	        return null;
	        
            }

            return new THREE.TubeBufferGeometry( path,
    					         1064,
    					         slRadius,
    					         8,
    					         false );
            
        });

        const geom = BufferGeometryUtils.mergeBufferGeometries( geomArray );
        geomArray.forEach( g => g.dispose() );
        
        const mesh = new THREE.Mesh( geom, solutionMaterial );

        threeCBs.add( mesh );

        return ( () => {

            threeCBs.remove(mesh);
            geom.dispose();

        });
        
    }, [streamlines, threeCBs]);


    //draws triangles of the triangulation
    // useEffect( () => {

    //     if( !threeCBs || !streamlines )
    //         return;
        
    //     const geom = DelaunayGeometry( streamlines.triangulation );

    //     const mesh = new THREE.Mesh( geom, solutionMaterial );

    //     threeCBs.add( mesh );
        
    //     return ( () => {

    //         threeCBs.remove(mesh);
    //         geom.dispose();

    //     });

    // }, [threeCBs, streamlines] );

    // draws circumcenters of the triangulation
    // useEffect( () => {

    //     if( !threeCBs || !streamlines )
    //         return;

    //     const centerRadius = .1;
        
    //     const sphereGeom = new THREE.SphereBufferGeometry( centerRadius, 15, 15 );

    //     const arr = streamlines.triangulation.getCenterArray();

    //     const geomArr = arr.map( ([x,y]) => sphereGeom.clone().translate(x,y,0) );

    //     const geom = BufferGeometryUtils.mergeBufferGeometries( geomArr );

    //     const mesh = new THREE.Mesh( geom, solutionMaterial );

    //     threeCBs.add( mesh );

    //     return ( () => {

    //         threeCBs.remove( mesh );
    //         geom.dispose();

    //     });
        
    // }, [threeCBs, streamlines] );


    
    
    //------------------------------------------------------------------------



    
    const funcInputCallback = useCallback(
        newFunc => setFunc({ func: newFunc }),
        [] );

    
    return (       
        <FullScreenBaseComponent backgroundColor={initColors.controlBar}
                                 fonts={fonts}>
          
          <ControlBar height={controlBarHeight} fontSize={initFontSize*controlBarFontSize} padding='.5em'>
            <span css={{
                paddingRight: '10%' }}>             
	      <FunctionInput onChangeFunc={funcInputCallback}
                             initFuncStr={initFuncStr}
                             leftSideOfEquation="dy/dx ="/>  
            </span>

            <div css={{
                margin: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '50%',
                height: '100%',
                paddingTop: '.5em',
                paddingBottom: '.5em',
                paddingLeft: '0em',
                paddingRight: '1.5em',             
            }}>

              <div  css={{
                  margin: 0,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' ,
                  justifyContent: 'space-around',
                  alignContent: 'center',
                  alignItems: 'center',               
              }}>
                <span>Arrow density:  </span>
                <span>
                  <Input size={4}
                         initValue={1/arrowGridData.gridSqSize}
                         onC={useCallback( val => setArrowGridData( agd => ({...agd, gridSqSize: Number(1/val)}) ) )}/>
                </span>
              </div>
              <div  css={{
                  margin: 0,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' ,
                  justifyContent: 'space-around',
                  alignContent: 'center',
                  alignItems: 'center',                 
              }}>      
                <span css={{           
                    paddingRight: '.5em' }}>Arrow length:    </span>
                <Input size={4}
                       initValue={arrowGridData.arrowLength}
                       onC={useCallback( val => setArrowGridData( agd => ({...agd, arrowLength: Number(val)}) ) )}/>
              </div>
              
              <div  css={{
                  margin: 0,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' ,
                  justifyContent: 'space-around',
                  alignContent: 'center',
                  alignItems: 'center',               
              }}>
                <span  css={{              
                    paddingRight: '.5em' }}>Approximation constant:    </span>
                <Input size={4}
                       initValue={approxH}
                       onC={useCallback( val => setApproxH( Number(val) ) )}/>
              </div>
            </div>
          </ControlBar>
          
          <Main height={100-controlBarHeight}
                fontSize={initFontSize*controlBarFontSize}>
            <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={controlsData}
            />
            <ClickablePlaneComp threeCBs={threeCBs}                           
                                clickCB={clickCB}/>             

          </Main>
          
        </FullScreenBaseComponent>);                              
}
