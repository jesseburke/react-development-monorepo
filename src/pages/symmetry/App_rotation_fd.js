import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Redirect, Switch, Route, Link, useRoute } from "wouter";
import {Router as WouterRouter} from 'wouter';

import {gsap} from 'gsap';

import { jsx } from '@emotion/core';
import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import FreeDrawComp from '../components/FreeDrawComp.js';
import GraphDrawComp from '../components/GraphDrawComp.js';
import RotateComp from '../components/RotateComp.js';
import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';
import Button from '../components/Button.js';
import ResetCameraButton from '../components/ResetCameraButton.js';
import Input from '../components/Input.js';

import useHashLocation from '../hooks/useHashLocation.js';

import useExpandingMesh from '../graphics/useExpandingMesh.js';
import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';

import gsapRotate from '../animations/gsapRotate.js';

import {fonts, halfXSize, halfYSize,
	initColors, initAxesData, initGridAndOriginData,
	labelStyle, initOrthographicData} from './constants.js';


//------------------------------------------------------------------------


const freeDrawMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
						       opacity: 1.0,
                                                       side: THREE.FrontSide});
const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = .35;
fixedMaterial.transparent = true;

const rotationDuration = .4;

const startingAngle = 30;

const degToRad = (deg) => (deg* 0.0174533);

const EPSILON = .00001;


export default function App() {

    const [,navigate] = useHashLocation();

    // this is only used to define threeCBs (which are used everywhere)
    const threeSceneRef = useRef(null);

    // following is passed to components that draw
    const threeCBs = useThreeCBs( threeSceneRef );    

    const [curAngle, setCurAngle] = useState( degToRad(startingAngle) );
    const [totalRotation, setTotalRotation] = useState(0.0);

    const [animating, setAnimating] = useState(false);

    // the animation timeline
    const [timeLine, setTimeLine] = useState(null);

     const cameraData =  useRef( initOrthographicData ,[] );

    //------------------------------------------------------------------------
    //
    // starting effects

    const userMesh = useExpandingMesh({ threeCBs });
    const fixedMesh = useExpandingMesh({ threeCBs });


    useGridAndOrigin({ threeCBs,
		       gridData: initGridAndOriginData });
    use2DAxes({ threeCBs, axesData: initAxesData });
    

    
    //------------------------------------------------------------------------

    const clearCB = useCallback( () => {

        if( !threeCBs ) return;
        
        if( userMesh ) {
            userMesh.clear();
        }

        if( fixedMesh ) {
            fixedMesh.clear();
        }

        navigate('/');

    }, [threeCBs, userMesh, fixedMesh] );
    

    const freeDrawDoneCBs = [userMesh.expandCB,
                             useCallback( mesh => {
                                 if(!mesh) return;
                                 mesh.material = fixedMaterial;
                                 fixedMesh.expandCB(mesh);
                             }, [fixedMesh])
                            ];


    const resetCB = useCallback( () => {

        if( !threeCBs ) return;
        
        if( userMesh.getMesh() ) {
            // rotate mesh back to original position
            gsapRotate({ mesh: userMesh.getMesh(),
		         delay: 0,
                         duration: rotationDuration,
                         quaternion: fixedMesh.getMesh().quaternion,			   
                         renderFunc: threeCBs.render,
		         clampToEnd: true,
                         onComplete: () => {
                             setAnimating(false);
                         } });                                      
        }

        setTotalRotation(0);
        setCurAngle( degToRad( startingAngle ) );
	
        navigate('/');

    }, [threeCBs, userMesh, fixedMesh] );

    const curAngleCB = useCallback( (value) =>  {

        setCurAngle( degToRad( normalizeAngleDeg( eval(value) ) ) );
        
    }, [] );

    const totalRotationCB = useCallback( (value) =>  {

        const newAngle = degToRad( normalizeAngleDeg(value) );

        const delta = newAngle - totalRotation;

	// this is so same number of hooks are called,
	// because gsapRotate is not calling the onComplete function if
	// delta is too small
	if( Math.abs(delta % 2*Math.PI) < EPSILON ) {

	    setAnimating(false);
	    setTotalRotation( t => t );	   
	    setAnimating(false);
	    return;
	}

        setAnimating(true);
        setTotalRotation( newAngle );

        gsapRotate({ mesh: userMesh.getMesh(),
		     delay: 0,
                     duration: rotationDuration,
                     angle: delta,			   
                     renderFunc: threeCBs.render,
		     clampToEnd: true,
                     onComplete: () => {
                         setAnimating(false);
                     } });                
    }, [userMesh] );
    

    const rotateCB = useCallback( () => {
        
        if (!userMesh.getMesh() || !threeCBs) {
            setAnimating(false);
	    setTotalRotation( t => t );	   
	    setAnimating(false);
	    return;
	}
        
        setAnimating(true);
        setTotalRotation( t => (t + curAngle)%(2*Math.PI) );

        gsapRotate({ mesh: userMesh.getMesh(),
		     delay: 0,
                     duration: rotationDuration,
                     angle: curAngle,			   
                     renderFunc: threeCBs.render,
		     clampToEnd: true,
                     onComplete: () => {
                         setAnimating(false);
                     }
                   });
        
    }, [userMesh, threeCBs, curAngle] );
    
    
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
	                    transforms={[]}/>              
              <Link href='/rotate'>
                <div css={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    fontSize: '1.25em',
                }}>
                  <Button>
                    Done drawing
                  </Button>
                </div>
              </Link>
            </Route>

            <Route  path='/rotate'>
              <div css={{
                  position: 'absolute',
                  top: '7%',
                  left: '5%',
                  border: '2px',
                  borderStyle: 'solid',
                  padding: '2em',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignContent: 'space-between',
                  fontSize: '1.25em'
              }}>                        
                
                <div  css={{ paddingLeft: '1em',
                             paddingRight: '1em',
                             paddingTop: '.75em',
                             paddingBottom: '.75em',
                             display: 'flex',
                             justifyContent: 'space-around',
                             alignItems: 'center'}}>
                  <span css={{
                      marginRight: '.5em'}}>
                    <Button onClickFunc={rotateCB}
                            active={!animating}
                    >
                      Rotate          
                    </Button>
                  </span>
                  <span  css={{
                      margin: '.5em'}}> by </span>
                  <span  css={{
                      margin: '.5em'}}>
                    <Input size={4}
                           value={round(radToDeg(curAngle), 2)}
                           onC={curAngleCB} />
                    {`\u{00B0}`}
                  </span>
                </div>

                <div css={{
                    margin: '.5em'}}>
                  <span css={{
                      margin: '.5em'}}>Total rotation: </span>
                  <Input size={4}
                         value={round(radToDeg(totalRotation), 2)}
                         onC={totalRotationCB}/>
                  {`\u{00B0}`} 
                </div>
                
              </div>
              <RotateComp curAngle={curAngle}
                          resetCB={resetCB}                         
                          threeCBs={threeCBs}
                          animating={animating}/>
            </Route>
          </WouterRouter>
          
        </FullScreenBaseComponent>
    );
}

function normalizeAngleDeg( angle ) {

    const newAngle = angle % 360;
    
    if ( newAngle > 180 ) {           
        return newAngle - 360;
    }

    else if ( newAngle < -180 ) {           
        return newAngle + 360;
    }

    return newAngle;

}

const radToDeg = (rad) => (rad * 57.2958);

function round(x, n = 3) {

    // x = -2.336596841557143
    
    return Math.round( x * Math.pow(10, n) )/Math.pow(10, n); 
    
}
