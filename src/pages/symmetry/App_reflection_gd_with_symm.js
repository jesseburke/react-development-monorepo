import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Redirect, Switch, Route, Link, useRoute } from "wouter";
import {Router as WouterRouter} from 'wouter';

import { jsx } from '@emotion/core';
import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import useHashLocation from '../hooks/useHashLocation.js';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import FreeDrawComp from '../components/FreeDrawComp.js';
import GraphDrawComp from '../components/GraphDrawComp.js';
import ClickablePlaneComp from '../components/ClickablePlaneComp.js';

import LineFactory from '../factories/LineFactory.js';
import ReflectionFactory from '../factories/ReflectionFactory.js';

import useExpandingMesh from '../graphics/useExpandingMesh.js';
import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';
import OriginLine from '../graphics/OriginLine.js';

import gsapRotate from '../animations/gsapRotate.js';
import gsapReflect from '../animations/gsapReflect.js';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';
import Button from '../components/Button.js'
import Input from '../components/Input.js';

import {fonts, halfXSize, halfYSize,
	initColors, initAxesData, initGridAndOriginData,
	labelStyle, initOrthographicData} from './constants.js';


//------------------------------------------------------------------------

const reflectionLineColor = 'rgb(231, 71, 41)';
const reflectionLineMaterial = new THREE.MeshBasicMaterial( { color: reflectionLineColor } );
const reflectionLineRadius = .05;

const freeDrawMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
						       opacity: 1.0,
                                                       side: THREE.FrontSide});

const fixedMaterial =  freeDrawMaterial.clone();
fixedMaterial.opacity = .15;
fixedMaterial.transparent = true;

const rotationDuration = .4;
const reflectionDuration = .5;

const startingPt = [1,1,0];

export default function App() {    

    const [,navigate] = useHashLocation();
    
    const threeSceneRef = useRef(null);
       
    const threeCBs = useThreeCBs( threeSceneRef );    
    
    const [line, setLine] = useState(LineFactory( new THREE.Vector3( ...startingPt ) ));

    const [transforms, setTransforms] = useState( [ReflectionFactory( line )] );
    
    const [lineMesh, setLineMesh] = useState(null);

    const [animating, setAnimating] = useState(false);

    const cameraData =  useRef( initOrthographicData ,[] );

    //------------------------------------------------------------------------
    //
    // starting effects    

    useGridAndOrigin({ threeCBs, gridData: initGridAndOriginData });
    use2DAxes({ threeCBs, axesData: initAxesData });



    //------------------------------------------------------------------------
    const userMesh = useExpandingMesh({ threeCBs });

    const freeDrawDoneCBs = [userMesh.expandCB ];                          
    
    const clearCB = useCallback( () => {

        if( !threeCBs ) return;        
        
        if( userMesh ) {
            userMesh.clear();
        }

        navigate('/');

    }, [threeCBs, userMesh] );
   
    
    useEffect( () => {
        
        if( !threeCBs || !line ) {
            setLineMesh(null);
            return;
        }
        
        const geom = line.makeGeometry({ radius: reflectionLineRadius });                  
        const mesh = new THREE.Mesh( geom, reflectionLineMaterial );
        setLineMesh( mesh );
        threeCBs.add( mesh );

        setTransforms([ ReflectionFactory( line ) ]);

        return () => {

            threeCBs.remove( mesh );
            geom.dispose();

        }

    }, [ threeCBs, line] );

    const chooseLineCB = useCallback( () => {
        
        navigate('/chooseLine');
        
    }, [] );

     // passed to ClickablePlaneComp
    const clickCB = useCallback( (pt) => {
       
        setLine( LineFactory(pt) );
        
        navigate('/');
        
    }, [] );

    const xCB = useCallback( (xValStr) => {

        const xVal = Number( xValStr );
        
        setLine( oldLine => {

            const yVal = oldLine.getEquation().y;

            // if yVal is already 0, then whatever xVal is, force line to be the vertical line
            if( yVal === 0 ) return LineFactory( new THREE.Vector3( 0, 1, 0) );

            else if( xVal === 0 ) {
                return LineFactory( new THREE.Vector3( 1, 0, 0 ) );              
            }            

            return LineFactory( new THREE.Vector3(yVal/xVal, 1, 0));
        });
        
    }, [] );

    const yCB = useCallback( (yValStr) => {

        const yVal = Number( yValStr );
        
        setLine( oldLine => {

            const xVal = oldLine.getEquation().x;

            // if xVal is already 0, then whatever yVal is, force line to be the horizontal line
            if( xVal === 0 ) return LineFactory( new THREE.Vector3( 1, 0, 0) );

            else if( yVal === 0 ) {
                return LineFactory( new THREE.Vector3( 0, 1, 0 ) );              
            }            

            return LineFactory( new THREE.Vector3(yVal/xVal, 1, 0));
        });
        
    } );

    return (

    	<FullScreenBaseComponent fonts={fonts}>

          <ThreeSceneComp ref={threeSceneRef} initCameraData={cameraData.current} />         

          <WouterRouter hook={useHashLocation}>
            
            <Route  path='/'>
              <GraphDrawComp threeCBs={threeCBs}
                             doneCBs={freeDrawDoneCBs}
                             transforms={transforms}
                             clearCB={clearCB}
                             material={freeDrawMaterial}
                             fontSize='1.25em'/>
              <div css={{
                  position: 'absolute',
                  top: '7%',
                  left: '5%',
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
                      margin: '.5em'}}> Reflecting about </span>                
                   <Input size={4}
                          onC={yCB}
                          key={line}
                         value={line.isVertical() ? 0 : 1 }/>
                  <span css={{margin:'.25em'}}> y = </span>
                  <Input size={4}
                         onC={xCB}
                         value={line ? line.getEquation().x : null}/>
                  <span css={{margin:'.25em'}}>x</span>                
                </div>

                <div css={{
                    margin: '.5em'}}>
                  <Link css={linkCss} href='/chooseLine'>Choose new line on graph</Link>
                </div>                
              </div>
            </Route>


            <Route path='/chooseLine'>
              <div css={{
                  position: 'absolute',
                  bottom: '5%',
                  left: '38%',
                  //width: '100%',
                  fontSize: '1.25em',
                  display: 'flex',            
                  alignItems: 'flex-end',
                  justifyContent: 'space-around'}}>
                <div>
                  Click on plane to choose reflection line
                </div>
              </div>
              <ClickablePlaneComp threeCBs={threeCBs}
                                  clickCB={clickCB}
                                  paused={animating}/>
            </Route>
            
	  </WouterRouter>
          
        </FullScreenBaseComponent>
    );
}

const linkCss={
        paddingLeft: '1em',
        paddingRight: '1em',
        paddingTop: '.25em',
        paddingBottom: '.25em',
        border: '2px',
        borderStyle: 'solid',
        borderRadius: '.35em',
        fontSize: '1em',
        margin: 0,
        width: '10em',
        // next line stops cursor from changing to text selection on hover
        cursor:'pointer'  ,
        textAlign: 'center',
        userSelect: 'none',
    textDecoration: 'none',
    color: 'black'
    }                
    
