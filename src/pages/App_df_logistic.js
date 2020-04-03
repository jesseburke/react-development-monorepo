import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import * as THREE from 'three';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import ControlBar from '../components/ControlBar.js';
import Main from '../components/Main.js';
import ResetCameraButton from '../components/ResetCameraButton.js';
import ClickablePlaneComp from '../components/ClickablePlaneComp.js';
import ArrowGridOptions from '../components/ArrowGridOptions.js';
import TexDisplayComp from '../components/TexDisplayComp.js';
import Slider from '../components/Slider.js';

import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';
import FunctionGraph2DGeom from '../graphics/FunctionGraph2DGeom.js';
import ArrowGrid from '../graphics/ArrowGrid.js';
import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.js';
import useDraggableMeshArray from '../graphics/useDraggableMeshArray.js';

import ArrowGeometry from '../graphics/ArrowGeometry.js';

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

const xMin = -20, xMax = 20;
const yMin = -20, yMax = 20;
const initBounds = {xMin, xMax, yMin, yMax};

const gridBounds = { xMin, xMax, yMin: xMin, yMax: xMax };

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

const initArrowGridData = {
    gridSqSize: .5,
    color: initColors.arrows,
    arrowLength: .75
};

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

const capacityMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color( initColors.testFunc ),
    side: THREE.FrontSide });

capacityMaterial.transparent = true;
capacityMaterial.opacity = .4;


const initAVal = 1.1;

const initKVal = 4.8;

const initApproxHValue = .01;

const logisticEquationTex = "\\frac{dy}{dx} = k \\!\\cdot\\! y - a \\!\\cdot\\! y^2";

const initialInitialPt = [1,1];

const precision = 3;

//------------------------------------------------------------------------

export default function App() {

    const [arrowGridData, setArrowGridData] = useState( initArrowGridData );

    const [bounds, setBounds] = useState(initBounds);
    
    const [axesData, setAxesData] = useState( initAxesData );

    const [gridData, setGridData] = useState( initGridData );

    const [controlsData, setControlsData] = useState( initControlsData );

    const [colors, setColors] = useState( initColors );

    const [func, setFunc] = useState({ func: (x,y) => initKVal*y - initAVal*y*y });

    const [initialPt, setInitialPt] = useState(initialInitialPt);

    const [meshArray, setMeshArray] = useState(null);

    const [approxH, setApproxH] = useState(initApproxHValue);

    const [aVal, setAVal] = useState(initAVal);

    const [kVal, setKVal] = useState(initKVal);

    const [aSliderMax, setASliderMax] = useState(30);

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    
    


    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ threeCBs,
		       bounds: gridBounds,
		       show: initGridData.show,
		       originColor: initGridData.originColor,
		       originRadius: .1 });

    use2DAxes({ threeCBs,
                bounds: bounds,
                radius: initAxesData.radius,
                color: initAxesData.color,
                show: initAxesData.show,
                showLabels: initAxesData.showLabels,
                labelStyle,
                xLabel: 't' });


    //-------------------------------------------------------------------------
    //
    // make the mesh for the initial point
    
    useEffect( () => {

        if( !threeCBs ) return;

        const geometry = new THREE.SphereBufferGeometry( solutionCurveRadius*2, 15, 15 );
        const material = new THREE.MeshBasicMaterial({ color: initColors.solution });

        const mesh = new THREE.Mesh( geometry, material )
              .translateX(initialInitialPt[0])
              .translateY(initialInitialPt[1]);

        threeCBs.add( mesh );
        setMeshArray([ mesh ]);

        return () => {

            if( mesh ) threeCBs.remove(mesh);
            geometry.dispose();
            material.dispose();
            
        };
        
        
    }, [threeCBs] );

    //-------------------------------------------------------------------------
    //
    // make initial condition point draggable

    // in this case there is no argument, because we know what is being dragged
    const dragCB = useCallback( () => {

        if( !meshArray || !meshArray[0] ) {
            setInitialPt( p => p );
            return;
        }

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
        
        if( !meshArray || !meshArray[0] || !initialPt ) return;

        let vec = new THREE.Vector3();

        meshArray[0].getWorldPosition(vec);

        const [d1, e1] = [ vec.x - initialPt[0] ,  vec.y - initialPt[1] ];

        if( d1 != 0 ) {
            meshArray[0].translateX( -d1 );
        }
        if( e1 != 0 ) {
            meshArray[0].translateY( -e1 );
        }      
        
    }, [threeCBs, meshArray, initialPt] );
    


    //------------------------------------------------------------------------
    //
    // arrowGrid effect
    
    useEffect( ()  => {

        if( !threeCBs ) return;

        const arrowGrid = ArrowGrid({ gridSqSize: arrowGridData.gridSqSize,
                                      color: arrowGridData.color,
                                      arrowLength: arrowGridData.arrowLength,
                                      bounds,
                                      func: func.func
                                    });

        threeCBs.add( arrowGrid.getMesh() );	
	
        return () => {
            threeCBs.remove( arrowGrid.getMesh() );
            arrowGrid.dispose();
        };
	
    }, [threeCBs, arrowGridData, func] );
    

    //------------------------------------------------------------------------
    //
    // solution effect

    const clickCB = useCallback( (pt) => {

        if( controlsEnabled ) {
            setInitialPt( s => s );
            return;
        }

        // if user clicks too close to boundary, don't want to deal with it
        if( pt.x > bounds.xMax  || pt.x < bounds.xMin ||
            pt.y > bounds.yMax  || pt.y < bounds.yMin )
        {
            setInitialPt( initialInitialPt );
            return;
        }

        setInitialPt( [pt.x, pt.y] );
        
    }, [controlsEnabled, bounds] );
    


    useEffect( () => {

        if( !threeCBs || !initialPt ) return;

        const dfag = DirectionFieldApproxGeom({ func: func.func,
                                                initialPt,
                                                bounds,
                                                h: approxH,
                                                radius: solutionCurveRadius});

        const mesh = new THREE.Mesh( dfag, solutionMaterial );

        threeCBs.add( mesh );      

        return () => {
            threeCBs.remove(mesh);
            dfag.dispose();
        };

    }, [threeCBs, initialPt, func, approxH] );
    

    
    //------------------------------------------------------------------------
    //
    // when sliders change:

    // change the function value

    useEffect( () => {

        setFunc({ func: (x,y) => kVal*y - (aVal)*y*y });
        
    }, [aVal, kVal] );
    

    // change the capacity line
    useEffect( () => {

        if( aVal === 0 ) return;

        if( !threeCBs ) return;

        const path = new THREE.LineCurve3( new THREE.Vector3(xMin, kVal/aVal),
                                           new THREE.Vector3(xMax, kVal/aVal) );
        
        const geom = new THREE.TubeBufferGeometry( path,
						   16,
						   testFuncRadius,
						   8,
						   false );
        
        const mesh = new THREE.Mesh( geom, capacityMaterial );

        threeCBs.add( mesh );

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };   
        
    }, [aVal, kVal, threeCBs] );  


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
                  alignItems: 'flex-start',
                  padding: '0em 3em'}}>
                <div css={{padding:'.25em 0',
                           textAlign: 'center'}}>
                  Logistic equation
                </div>
                <TexDisplayComp userCss={{padding:'.25em 0'}}
                                str={logisticEquationTex}
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
                  value={Number.parseFloat(aVal)}
                  CB={val => setAVal(val)}
                  label={'a'}
                  max={xMax}
                  min={0}
                  precision={precision}
                />

                <Slider
                  userCss={{padding: '.25em 0em'}}
                  value={Number.parseFloat(kVal)}
                  CB={val => setKVal(val)}
                  label={'k'}
                  max={aVal*yMax}
                  precision={precision}
                />
                
              </div>
            </div>           
            
            <ArrowGridOptions
              userCss={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 4,
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
                            clearColor={initColors.clearColor}
            />
            <ClickablePlaneComp threeCBs={threeCBs}                           
                                clickCB={clickCB}
            />          

          </Main>
          
        </FullScreenBaseComponent>);                              
}

// <ResetCameraButton key="resetCameraButton"
//                              onClickFunc={resetCameraCB}
//                              color={controlsEnabled ? colors.controlBar : null }
//                              userCss={{ top: '85%',
//                                         left: '5%',
//                                         userSelect: 'none'}}/>         



