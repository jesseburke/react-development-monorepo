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


import MatrixFactory from '../math/MatrixFactory.js';

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
    secPt: '#E16962',
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


const initAVal = .2;
const initBVal = 1;
// will have -abBound < a^2 - 4b > abBound
const abBound = 20;
const aMax = 5;
const aMin = -5;
const aStep = .1;

const initApproxHValue = .01;

const LatexSecOrderEquation = "(\\frac{d}{dx})^2(y) + a \\cdot \\frac{d}{dx}(y) + b \\cdot y  = 0";

const initInitConds = [[1,3], [3,3]];




//------------------------------------------------------------------------

export default function App() {

    const [arrowGridData, setArrowGridData] = useState( initArrowGridData );    

    const [axesData, setAxesData] = useState( initAxesData );

    const [gridData, setGridData] = useState( initGridData );

    const [controlsData, setControlsData] = useState( initControlsData );

    const [colors, setColors] = useState( initColors );

    const [aVal, setAVal] = useState(initAVal);

    // this init value should be between the min and max for b
    const [bVal, setBVal] = useState(initBVal);

    const [aSliderMax, setASliderMax] = useState(30);

    const [initialConds, setInitialConds] = useState(initInitConds);

    const [initialPt1Mesh, setInitialPt1Mesh] = useState(null);

    const [initialPt2Mesh, setInitialPt2Mesh] = useState(null);

    const [solnStr, setSolnStr] = useState(null);

    const [solnTexStr, setSolnTexStr] = useState(null);

    const [sigDig, setSigDig] = useState(1);    

    const [controlsEnabled, setControlsEnabled] = useState(false);

    const threeSceneRef = useRef(null);

    // following passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    
    


    //------------------------------------------------------------------------
    //
    // initial effects

    useGridAndOrigin({ gridData, threeCBs, originRadius: .1 });
    use2DAxes({ threeCBs, axesData });
        

    
    
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
        setInitialPt1Mesh( mesh1 );
        //console.log('effect based on initialConds called');

        const geometry2 = new THREE.SphereBufferGeometry( radius, 15, 15 );
        const material2 = new THREE.MeshBasicMaterial({ color: initColors.secPt });

        const mesh2 = new THREE.Mesh( geometry2, material2 )
              .translateX(initialConds[1][0])
              .translateY(initialConds[1][1]);

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
        
        
    }, [threeCBs, initialConds] );

    //-------------------------------------------------------------------------
    //
    // make initial condition points draggable

    useEffect( () => {

        if( !threeCBs ) return;
        
        const dragendCB = (draggedMesh) => {

            console.log('dragendcb called');

            // this will be where new position is stored
            const vec = new THREE.Vector3();

            // depends on whether pt1 or pt2 is being dragged
            
            if( draggedMesh.id === initialPt1Mesh.id ) {

                draggedMesh.getWorldPosition( vec );

                setInitialConds( ([p1, p2]) => [[round(vec.x, sigDig+1), round(vec.y, sigDig+1)], p2] );
            }

            else if( draggedMesh.id === initialPt2Mesh.id ) {

                draggedMesh.getWorldPosition( vec );

                setInitialConds( ([p1, p2]) => [p1, [round(vec.x, sigDig+1), round(vec.y, sigDig+1)]] );
            }
            
        };
            
        
        const controlsDisposeFunc = threeCBs.addDragControls({ meshArray: [initialPt1Mesh, initialPt2Mesh],
                                                               dragendCB});

        return () => {

            if( controlsDisposeFunc ) controlsDisposeFunc();

        };
        
    }, [threeCBs, initialPt1Mesh, initialPt2Mesh] );

    
    
    
    //------------------------------------------------------------------------
    //
    // change solnStr and solnTexStr
    

    useEffect( () => {

        const c = calcSolnStr( aVal, bVal, initialConds, sigDig+1 ) ;

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
                          padding: '0em 2em'}}>
                <Slider
                  userCss={{padding: '.25em 0em'}}
                  value={aVal}
                  CB={val => setAVal(val)}
                  label={'a'}                  
                  max={aMax}
                  min={aMin}
                  step={aStep}
                  sigDig={sigDig}
                />

                <Slider
                  userCss={{padding: '.25em 0em'}}
                  value={bVal}
                  CB={val => setBVal(val)}
                  label={'b'}
                  min={(aVal*aVal - abBound)/4}
                  max={(aVal*aVal + abBound)/4}
                  sigDig={sigDig}
                />                
              </div>
            </div>

            <div css={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0em 3em',
                flex: 4,
                height: '100%',
                borderRight: '1px solid'}}>
              
              <div css={{padding:'.25em 0',
                         textAlign: 'center'}}>
                <TexDisplayComp userCss={{padding:'.25em 0'}}
                                str={`a^2 - 4b = ${round(aVal*aVal - 4*bVal,sigDig+1).toString()}`}
                />               
              </div>
              <div css={{
                  padding: '.5em 0',
                  fontSize: '1.00em'
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




// a,b are numbers, initialConds is a 2 elt array of 2 elt arrays
function calcSolnStr(a, b, initialConds, sigDig) {

    const [[x0, y0], [x1, y1]] = initialConds;

    if( a*a - 4*b > 0 ) {

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
        
        return {str: `${C}*e^(${m1}*x) + ${D}*e^(${m2}*x)`,
                texStr: `y = ${C}*e^{${m1}*x} + ${D}*e^{${m2}*x}`};        
    }

    
    else if( a*a - 4*b < 0 ) {

        // in this case solns have form y = e^{-ax/2}(C cos(kx) + D sin(kx)), where k = (4*b-a^2)^(1/2)/4

        let k =  Math.sqrt( 4*b - a*a )/2;

        const alpha = Math.E**(-a*x0/2) * Math.cos(k*x0);
        const beta = Math.E**(-a*x0/2) * Math.sin(k*x0);
        const gamma = Math.E**(-a*x1/2) * ( -a/2*Math.cos(k*x1) - k*Math.sin(k*x1) );
        const delta = Math.E**(-a*x1/2) * ( -a/2*Math.sin(k*x1) - k*Math.cos(k*x1) );

        // should now have alpha*C + beta*D = y0, gamma*C + delta*D = y1,
        const A = [[ alpha, beta, y0], [gamma, delta, y1]];
        const m = MatrixFactory( A ).rref().getArray();
        const C = round(m[0][2], sigDig);
        const D = round(m[1][2], sigDig);
        
        k = round( k, sigDig );

        return {str: `e^(-(${a})*x/2)*( (${C})*cos((${k})*x) + (${D})*sin((${k})*x) )`,
                texStr: `y = e^{${-a}*x/2}( ${C}\\cdot\\cos(${k}x) + ${D}\\cdot\\sin(${k}x) )`};                      
    }

    else if( a*a - 4*b === 0 ) {

        // in this case solns have the form y = Cxe^{-ax/2} + De^{-ax/2}

        const alpha = Math.E**(-a*x0/2) * x0;
        const beta = Math.E**(-a*x0/2);
        const gamma = Math.E**(-a*x1/2) * (-a/2) * x0 + Math.E**(-a*x1/2);
        const delta = Math.E**(-a*x1/2) * (-a/2);

        // should now have alpha*C + beta*D = y0, gamma*C + delta*D = y1,
        const A = [[ alpha, beta, y0], [gamma, delta, y1]];
        const m = MatrixFactory( A ).rref().getArray();
        const C = round(m[0][2], sigDig);
        const D = round(m[1][2], sigDig);

        return {str: `(${C})*x*e^(-(${a})*x/2) + (${D})*e^(-(${a})*x/2)`,
                texStr: `y = ${C}\\cdot x e^{${-a}*x/2} + ${D}\\cdot e^{${-a}*x/2}`};        
    }    
}




function round(x, n = 2) {

    // x = -2.336596841557143
    
    return Number(( x * Math.pow(10, n) )/Math.pow(10, n)).toFixed(n); 
    
}

