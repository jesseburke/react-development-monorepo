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
import ClickablePlaneComp from '../components/ClickablePlaneComp.js';
import Input from '../components/Input.js';
import Slider from '../components/Slider.js';
import TexDisplayComp from '../components/TexDisplayComp.js';
import InitialCondsComp from '../components/InitialCondsComp.js';

import useGridAndOrigin from '../graphics/useGridAndOriginNew.js';
import use2DAxes from '../graphics/use2DAxes.js';
import use3DAxes from '../graphics/use3DAxes.js';
import FunctionGraph2DGeom from '../graphics/FunctionGraph2DGeom.js';

import {processNum, throttle} from '../utils/BaseUtils.js';

import {solnStrs} from '../math/differentialEquations/secOrderConstantCoeff.js';

import {initArrowGridData, initAxesData,
        initGridData, initControlsData, secControlsData,
        bounds, initCameraData,
        initFuncStr, initXFuncStr, fonts,
        initYFuncStr} from './constants.js';



//------------------------------------------------------------------------
//
// initial data
//

export const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    firstPt: '#C2374F',
    secPt: '#C2374F',
    testFunc: '#E16962',//#DBBBB0',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0'
};


const {xMin, xMax, yMin, yMax} = bounds;

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


const initAVal = 2.9;
const initBVal = 1.9;
// will have -abBound < a^2 - 4b > abBound
const abBound = 20;
const aMax = 5;
const aMin = -5;
const aStep = .1;

const initApproxHValue = .01;

const LatexSecOrderEquation = "(\\frac{d}{dx})^2(y) + a \\cdot \\frac{d}{dx}(y) + b \\cdot y  = 0";

const initInitConds = [[4,7], [7,5]];

const initialPointMeshRadius = .4;

// in msec, for dragging
const throttleTime = 100;

const initSigDig = 3;

const initPrecision = 4;
const initCondsPrecision = 4;
const sliderPrecision = 3;


//------------------------------------------------------------------------

export default function App() {

    const [arrowGridData, setArrowGridData] = useState( initArrowGridData );    

    const [axesData, setAxesData] = useState( initAxesData );

    const [gridData, setGridData] = useState( initGridData );

    const [controlsData, setControlsData] = useState( initControlsData );

    const [colors, setColors] = useState( initColors );

    const [aVal, setAVal] = useState(processNum(initAVal, precision));

    // this init value should be between the min and max for b
    const [bVal, setBVal] = useState(processNum(initBVal, precision));

    const [aSliderMax, setASliderMax] = useState(30);

    const [initialConds, setInitialConds] = useState(initInitConds);

    const [initialPt1Mesh, setInitialPt1Mesh] = useState(null);

    const [initialPt2Mesh, setInitialPt2Mesh] = useState(null);

    const [solnStr, setSolnStr] = useState(null);

    const [solnTexStr, setSolnTexStr] = useState(null);

    const [sigDig, setSigDig] = useState(initSigDig);

    const [precision, setPrecision] = useState(initPrecision);    

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    
    


    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ gridData, threeCBs, originRadius: .1 });
    use2DAxes({ threeCBs, axesData });

    // make the meshes for the initial points
    useEffect( () => {

        if( !threeCBs ) return;

        const geometry1 = new THREE.SphereBufferGeometry( initialPointMeshRadius, 15, 15 );
        const material1 = new THREE.MeshBasicMaterial({ color: initColors.firstPt });

        const mesh1 = new THREE.Mesh( geometry1, material1 )
              .translateX(initInitConds[0][0])
              .translateY(initInitConds[0][1]);

        threeCBs.add( mesh1 );
        setInitialPt1Mesh( mesh1 );
        //console.log('effect based on initialConds called');

        const geometry2 = new THREE.SphereBufferGeometry( initialPointMeshRadius, 15, 15 );
        const material2 = new THREE.MeshBasicMaterial({ color: initColors.secPt });

        material2.transparent = true;
        material2.opacity = .5;

        const mesh2 = new THREE.Mesh( geometry2, material2 )
              .translateX(initInitConds[1][0])
              .translateY(initInitConds[1][1]);

        threeCBs.add( mesh2 );
        setInitialPt2Mesh( mesh2 );

        return () => {

            if( mesh1 ) threeCBs.remove(mesh1);
            geometry1.dispose();
            material1.dispose();

            if( mesh2 ) threeCBs.remove(mesh2);
            geometry2.dispose();
            material2.dispose();

            
            
        };
        
        
    }, [threeCBs] );

    //-------------------------------------------------------------------------
    //
    // make initial condition points draggable

    useEffect( () => {

        if( !threeCBs ) return;
        
        
        const dragendCB = (draggedMesh) => {

            // this will be where new position is stored
            const vec = new THREE.Vector3();

            // depends on whether pt1 or pt2 is being dragged
            
            if( draggedMesh.id === initialPt1Mesh.id ) {

                draggedMesh.getWorldPosition( vec );

                setInitialConds( ([p1, p2]) =>
                                 [[processNum(vec.x, initCondsPrecision).str,
                                   processNum(vec.y, initCondsPrecision).str],
                                  p2] );
            }

            else if( draggedMesh.id === initialPt2Mesh.id ) {

                draggedMesh.getWorldPosition( vec );

                setInitialConds( ([p1, p2]) => [p1,
                                                [processNum(vec.x, initCondsPrecision).str,
                                                 processNum(vec.y, initCondsPrecision).str],
                                               ] );
            }
            
        };
        
        const controlsDisposeFunc = threeCBs.addDragControls({ meshArray: [initialPt1Mesh, initialPt2Mesh],
                                                               dragCB: throttle(dragendCB, throttleTime),
                                                               dragendCB});
        return () => {

            if( controlsDisposeFunc ) controlsDisposeFunc();

        };
        
    }, [threeCBs, initialPt1Mesh, initialPt2Mesh] );

    
    
    
    //------------------------------------------------------------------------
    //
    // when initialConds change, move the initialPointMeshs

    useEffect( () => {

        if( !threeCBs ) return;
        
        if( !initialPt1Mesh || !initialPt2Mesh ) return;

        let vec1 = new THREE.Vector3();
        let vec2 = new THREE.Vector3();

        initialPt1Mesh.getWorldPosition(vec1);
        initialPt2Mesh.getWorldPosition(vec2);

        const [d1, e1] = [ vec1.x - initialConds[0][0] ,  vec1.y - initialConds[0][1] ];
        const [d2, e2] = [ vec2.x - initialConds[1][0] ,  vec2.y - initialConds[1][1] ];

        if( d1 != 0 ) {
            initialPt1Mesh.translateX( -d1 );
        }
        if( e1 != 0 ) {
            initialPt1Mesh.translateY( -e1 );
        }
        if( d2 != 0 ) {
            initialPt2Mesh.translateX( -d2 );
        }
        if( e2 != 0 ) {
            initialPt2Mesh.translateY( -e2 );
        }
        
    }, [threeCBs, initialConds] );

    
    
    
    //------------------------------------------------------------------------
    //
    // change solnStr and solnTexStr
    

    useEffect( () => {

        const c = solnStrs( Number.parseFloat(aVal.str), Number.parseFloat(bVal.str), initialConds, precision ) ;

        if( !c ) {

            setSolnStr( null );
            setSolnTexStr( null );

            return;
        }
        
        setSolnStr( c.str );
        setSolnTexStr( c.texStr );
        
    }, [aVal, bVal, initialConds, sigDig] );

    //------------------------------------------------------------------------
    //
    // solution display effect

    useEffect( () => {

        if( !threeCBs || !solnStr ) return;
        
        const solnFunc = funcParser( solnStr );

        const geom = FunctionGraph2DGeom({ func: solnFunc, bounds });              
        
        const mesh = new THREE.Mesh( geom, testFuncMaterial );

        threeCBs.add( mesh );

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
        
    }, [threeCBs, initialConds, bounds, solnStr] );
    
    
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
                padding: '.5em .5em',
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
                  padding: '0em 2em'}}>
                <div css={{padding:'.25em 0',
                           textAlign: 'center'}}>
                  2nd order linear, w/ constant coefficients
                </div>
                <div css={{whiteSpace: 'nowrap'}}>
                  <TexDisplayComp userCss={{padding:'.25em 0'}}
                                  str={LatexSecOrderEquation}
                  />
                </div>
              </div>

              <div css={{ margin: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'flex-start',
                          padding: '0em 1em'}}>
                <Slider
                  userCss={{padding: '.25em 0em'}}
                  value={Number.parseFloat(aVal.str)}
                  CB={val =>
                      setAVal(processNum(Number.parseFloat(val), precision))}
                  label={'a'}                  
                  max={aMax}
                  min={aMin}
                  step={aStep}
                  precision={sliderPrecision}
                />

                <Slider
                  userCss={{padding: '.25em 0em'}}
                  value={Number.parseFloat(bVal.str)}
                  CB={val =>
                      setBVal(processNum(Number.parseFloat(val), precision))}
                  label={'b'}
                  min={(Number.parseFloat(aVal.str)*Number.parseFloat(aVal.str) - abBound)/4}
                  max={(Number.parseFloat(aVal.str)*Number.parseFloat(aVal.str) + abBound)/4}
                  precision={sliderPrecision}
                />                
              </div>
            </div>

            <div css={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0em 2em',
                flex: 5,
                height: '100%',
                borderRight: '1px solid'}}>
              
              <div css={{padding:'.25em 0',
                         textAlign: 'center'}}>
                <TexDisplayComp userCss={{padding:'.25em 0'}}
                                str={`a^2 - 4b = ${processNum(Number.parseFloat(aVal.str)*Number.parseFloat(aVal.str) - 4*Number.parseFloat(bVal.str), precision).texStr}`}
                />               
              </div>
              <div css={{
                  padding: '.5em 0',
                  fontSize: '1.00em',
                  whiteSpace: 'nowrap'
              }}>
                <TexDisplayComp userCss={{padding:'.25em 0'}}
                                str={solnTexStr}
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

          </Main>
          
        </FullScreenBaseComponent>);                              
}


