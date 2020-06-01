import React, { useState, useRef, useEffect, useCallback } from 'react';

import {Route, Link } from "wouter";
import {Router as WouterRouter} from 'wouter';

import { jsx } from '@emotion/core';
import * as THREE from 'three';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import FreeDrawComp from '../components/FreeDrawComp.js';
import TranslateComp from '../components/TranslateComp.js';
import Input from '../components/Input.js';

import useExpandingMesh from '../graphics/useExpandingMesh.js';
import useHashLocation from '../hooks/useHashLocation.js';
import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';

import gsapTranslate from '../animations/gsapTranslate.js';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';
import Button from '../components/Button.js';

import {fonts,
	initColors, initAxesData, initGridAndOriginData,
	labelStyle, initOrthographicData} from './constants.js';

//------------------------------------------------------------------------


// const freeDrawMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
// 						       opacity: 1.0,
//                                                        side: THREE.FrontSide});
// const fixedMaterial =  freeDrawMaterial.clone();
// fixedMaterial.opacity = .35;
// fixedMaterial.transparent = true;


const fixedMaterial =  new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
						     opacity: 1.0,
                                                     side: THREE.FrontSide});
fixedMaterial.opacity = .35;
fixedMaterial.transparent = true;


const translationDuration = .4;

const startingTranslation = [2,1];

const EPSILON = .00001;

const freeDrawMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
						       opacity: 1.0,
                                                       side: THREE.FrontSide});
    


export default function App() {

    const [,navigate] = useHashLocation();

    // this is only used to define threeCBs (which are used everywhere)
    const threeSceneRef = useRef(null);

    // following is passed to components that draw
    const threeCBs = useThreeCBs( threeSceneRef );      
    
    const [xCurTranslation, setXCurTranslation] = useState( startingTranslation[0] );
    const [yCurTranslation, setYCurTranslation] = useState( startingTranslation[1] );
    
    const [xTotalTranslation, setXTotalTranslation] = useState(0);
    const [yTotalTranslation, setYTotalTranslation] = useState(0);

    const [animating, setAnimating] = useState(false);
    
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

        setXTotalTranslation(0);
        setYTotalTranslation(0);
        setXCurTranslation( startingTranslation[0] );
        setYCurTranslation( startingTranslation[1] );
        
        navigate('/');

    }, [threeCBs, userMesh, fixedMesh, navigate] );

    const freeDrawDoneCBs = [userMesh.expandCB,
                             useCallback( (mesh) => {
                                 if( !mesh ) return;
                                 mesh.material = fixedMaterial;
                                 fixedMesh.expandCB(mesh);
                             }, [fixedMesh])
                            ];


    const resetCB = useCallback( () => {

        if( !threeCBs ) return;
        
	if( userMesh.getMesh() ) {

	    gsapTranslate({ mesh: userMesh.getMesh(),
			    delay: 0,
			    duration: translationDuration,
			    toVec: fixedMesh.getMesh().position,
			    renderFunc: threeCBs.render,
			    clampToEnd: false,
			    onStart: () => setAnimating(true),
			    onComplete: () => setAnimating(false)
			  });
        }
	
      
	
        navigate('/');

    }, [threeCBs, userMesh, fixedMesh, navigate] );

    const xCurTranslationCB = useCallback( (value) =>  {      
        setXCurTranslation( Number(eval(value)) );      
    }, []);

    const yCurTranslationCB = useCallback( (value) =>  {
        setYCurTranslation( Number(eval(value)) );   
    }, []);

    const xTotalTranslationCB = useCallback( (value) =>  {
        setXTotalTranslation( Number(eval(value)) );
    }, []);

    const yTotalTranslationCB = useCallback( (value) =>  {
        setYTotalTranslation(Number(eval(value)));         
    }, []);

    useEffect( () => {

        if( !threeCBs || !userMesh.getMesh() ) {            
            return;
        }

        //setAnimating(true);
        
        gsapTranslate({ mesh: userMesh.getMesh(),
                        delay: 0,
                        duration: translationDuration,
                        toVec: new THREE.Vector3(xTotalTranslation,yTotalTranslation,0),
                        //translateVec: new THREE.Vector3(newVal,yTotalTranslation,0),
                        renderFunc: threeCBs.render,
                        clampToEnd: false,		
			onComplete: () => setAnimating(false)
                      });
        
    }, [threeCBs, userMesh, xTotalTranslation, yTotalTranslation]);

    const translateCB = useCallback( () => {
	
        if (!userMesh.getMesh() || !threeCBs) return;

        //console.log('translatecb called with xcurtrans = ', xCurTranslation,
        //' and ycurtrans = ', yCurTranslation);

        setAnimating(true);
        setXTotalTranslation( x => x + xCurTranslation );
        setYTotalTranslation( y => y + yCurTranslation );

        gsapTranslate({ mesh: userMesh.getMesh(),
    		        delay: 0,
                        duration: translationDuration,
                        translateVec: new THREE.Vector3(xCurTranslation,yCurTranslation,0),
                        renderFunc: threeCBs.render,    		     
                        onComplete: () => {
                            setAnimating(false);
                        }
                      });
	
    }, [userMesh, threeCBs, xCurTranslation, yCurTranslation] );
    
    
    return (

    	<FullScreenBaseComponent fonts={fonts}>
          <ThreeSceneComp ref={elt => threeSceneRef.current = elt}
                          initCameraData={cameraData.current} />          

          <WouterRouter hook={useHashLocation}>
            
            <Route path='/'>
               <FreeDrawComp threeCBs={threeCBs}                                   
                             doneCBs={freeDrawDoneCBs}
                             material={freeDrawMaterial}
                             clearCB={clearCB}
                             transforms={[]}
                             fontSize={'1.25em'}/>              
              <Link href='/translate'>
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
              <div css={{
                  position: 'absolute',
                  top: '10%',
                  left: '80%',
                  width: '100%',
                  fontSize: '1.25em',
              }}>              
              </div>
            </Route>

            <Route  path='/translate'>
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
                    <Button onClickFunc={ translateCB }
                            active={!animating}>
                      Translate          
                    </Button>
                  </span>
                  <span  css={{
                      margin: '.5em'}}> by </span>
                  <span  css={{
                      margin: '.5em'}}>
                    <Input size={2}
                           value={xCurTranslation}
                           onC={xCurTranslationCB} />
                    ,
                    <Input size={2}
                           value={yCurTranslation}
                           onC={yCurTranslationCB} />
                  </span>
                </div>

                <div css={{
                    margin: '.5em'}}>
                  <span css={{
                      margin: '.5em'}}>Total translation: </span>
                  <span  css={{
                      margin: '.5em'}}>
                    <Input size={2}
                           value={xTotalTranslation}
                           onC={xTotalTranslationCB} />
                    <Input size={2}
                           value={yTotalTranslation}
                           onC={yTotalTranslationCB} />
                  </span>            
                </div>            
              </div>
              <TranslateComp resetCB={resetCB}
                             xCurTranslation={xCurTranslation}
                             yCurTranslation={yCurTranslation}                                       
                             threeCBs={threeCBs}
                             animating={animating}/>
            </Route>
          </WouterRouter>
          
        </FullScreenBaseComponent>
    );
}


