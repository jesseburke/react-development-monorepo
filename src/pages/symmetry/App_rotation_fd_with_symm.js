import React, { useState, useRef, useEffect, useCallback } from 'react';

import {Route, Link, useRoute } from "wouter";
import {Router as WouterRouter} from 'wouter';

import { jsx } from '@emotion/core';
import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import FreeDrawComp from '../components/FreeDrawComp.js';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';
import ResetCameraButton from '../components/ResetCameraButton.js';
import Input from '../components/Input.js';

import useHashLocation from '../hooks/useHashLocation.js';

import RationalRotationFactory from '../factories/RationalRotationFactory.js';
import RationalRotationCSFactory from '../factories/RationalRotationCSFactory.js';

import useExpandingMesh from '../graphics/useExpandingMesh.js';
import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';

import {eGCD} from '../utils/BaseUtils.js';

import {fonts, halfXSize, halfYSize,
	initColors, initAxesData, initGridAndOriginData,
	labelStyle, initOrthographicData} from './constants.js';


const freeDrawMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
						       opacity: 1.0,
                                                       side: THREE.FrontSide});
const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = .35;
fixedMaterial.transparent = true;

const degToRad = (deg) => (deg* 0.0174533);

const EPSILON = .00001;
const roundingConst = 2;


export default function App() {

    const [,navigate] = useHashLocation();

    // this is only used to define threeCBs (which are used everywhere)
    const threeSceneRef = useRef(null);

    // following is passed to components that draw
    const threeCBs = useThreeCBs( threeSceneRef );    

    const [rotationArray, setRotationArray] = useState(null);
    const [transforms, setTransforms] = useState([]);

    const cameraData =  useRef( initOrthographicData ,[] );

    const userMesh = useExpandingMesh({ threeCBs });

    useGridAndOrigin({ threeCBs, gridData: initGridAndOriginData });
    use2DAxes({ threeCBs, axesData: initAxesData });

 

    
    //------------------------------------------------------------------------

    const clearCB = useCallback( () => {

        if( !threeCBs ) return;        
        
        if( userMesh ) {
            userMesh.clear();
        }

        navigate('/');

    }, [threeCBs, userMesh, navigate] );
    

    const freeDrawDoneCBs = [userMesh.expandCB]; 

    const angleCB = useCallback( (inputStr) => {

        const [m, n] = toFrac(Number(inputStr), roundingConst);

        if( m === 0 ) {

            setRotationArray( null );
            return;

        }

        const rrcs = RationalRotationCSFactory( m, n );
        
        setRotationArray( rrcs );
        
    }, [] );

    useEffect( () => {

        if( !rotationArray) {
            setTransforms([]);
            return;
        }
        
        setTransforms( rotationArray.getElementArray() ); 
        
    }, [rotationArray]); 
    
    return (

    	<FullScreenBaseComponent fonts={fonts}>
          <ThreeSceneComp ref={elt => threeSceneRef.current = elt}                         
                          initCameraData={cameraData.current}/>          

          <WouterRouter hook={useHashLocation}>
            
            <Route path='/'>
              <FreeDrawComp threeCBs={threeCBs}                                   
                            doneCBs={freeDrawDoneCBs}
                            clearCB={clearCB}
                            material={freeDrawMaterial}
                            transforms={transforms}/>
              <div css={{
                  position: 'absolute',
                  top: '7%',
                  left: '5%',
                  width: '30%',
                  border: '2px',
                  borderStyle: 'solid',
                  padding: '1em',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1.25em',
                  userSelect: 'none'
              }}>                        
                
                <div  css={{ paddingLeft: '1em',
                             paddingRight: '1em',
                             paddingTop: '.75em',
                             paddingBottom: '.75em',
                             display: 'flex',
                             justifyContent: 'space-around',
                             alignItems: 'baseline'}}>
                  
                  <span  css={{
                      margin: '.5em'}}> Symmetric under rotation by </span>                
                  <Input size={4}
                         onC={angleCB}
                  />                          
                </div>
                <div>
                  Rotational Symmetry Group:
                  {rotationArray ? 'C'+rotationArray.getOrder() : null}
                </div>
              
              </div>            
            </Route>

          </WouterRouter>
          
        </FullScreenBaseComponent>
    );
}

function normalizeAngleDeg( angle ) {

    const newAngle = angle % 360;
    
    if ( newAngle < 0 ) {           
        return newAngle + 360;
    }

    else if ( newAngle > 360 ) {           
        return newAngle - 360;
    }

    return newAngle;

}

const radToDeg = (rad) => (rad * 57.2958);

function round(x, n = 3) {

    // x = -2.336596841557143
    
    return Math.round( x * Math.pow(10, n) )/Math.pow(10, n); 
    
}

    const toFrac = (x, n) => {

        if( !Number.isInteger(n) ) {

            console.log('toFrac received a non-integer second argument; returned null');

            return null;
        }            
        
        if( n <= 0 ) return x;
        
        let num = x*Math.pow(10, n);
        let denom = Math.pow(10, n);

        while( num%10 === 0 && denom >= 10) {

            num = num/10;
            denom = denom/10;

        }

        return [num, denom];
        
    };
    
