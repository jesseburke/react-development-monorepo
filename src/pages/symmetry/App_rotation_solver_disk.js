import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import {gsap} from 'gsap';

import gsapRotate from '../animations/gsapRotate.js';
import gsapTextAnimation from '../animations/gsapTextAnimation.js';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import ClickablePlaneComp from '../components/ClickablePlaneComp.js';
import {rotatedArrowheadGeom} from '../graphics/RotatedArrowhead.js';

import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';
import OriginLine from '../graphics/OriginLine.js';
import LinePathGeom, {RegularNgonPts} from '../graphics/LinePathGeom.js';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';
import Button from '../components/Button.js';
import ResetCameraButton from '../components/ResetCameraButton.js';
import Input from '../components/Input.js';

import {fonts, halfXSize, halfYSize,
	initColors, initAxesData, initGridAndOriginData,
	labelStyle, initOrthographicData} from './constants.js';

//------------------------------------------------------------------------


const textDisplayStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '3em',
    top: '25%',
    left: '3%'
};

const innerRadius = 7;
const outerRadius = 10;
const thetaSegments = 128;


const degToRad = (deg) => (deg* 0.0174533);
const radToDeg = (rad) => (rad * 57.2958);

const figureRadius = .75;
const figureVertexSize = 1.5;
const figureMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
						     opacity: 1.0,
                                                     side: THREE.FrontSide});

const rotatedArrowMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(231, 71, 41)' });
const symmLineMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(150, 150, 150)' });
symmLineMaterial.transparent = true;
const lineRadius = .1;



const EPSILON = .001;
const gridSize = 100;

const startingAngle = 30;
const startPt = {x: 2.5, y: 0};


export default function App() {    

    const threeSceneRef = useRef(null);
    
    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );
    
    const [figureMesh, setFigureMesh] = useState(null);
    const [fixedMesh, setFixedMesh] = useState(null);

    const [curAngle, setCurAngle] = useState(
        degToRad( normalizeAngleDeg(startingAngle) ) );

    const [rotatedArrowMesh, setRotatedArrowMesh] = useState(null);
    const [rotatedArrowPt, setRotatedArrowPt] = useState(startPt);
   
    // this is the array of symmetries found by the user
    const [symmFoundArray, setSymmFoundArray] = useState([]);   
    
    const [animating, setAnimating] = useState(false);  
    
    const cameraData =  useRef( initOrthographicData ,[] );


    // adds the grid and origin to the ThreeScene  
    useGridAndOrigin({ threeCBs,
		       gridData: Object.assign(initGridAndOriginData, {size: gridSize}) });
    use2DAxes({ threeCBs, axesData: initAxesData });


    //------------------------------------------------------------------------
    //
    // draw two copies of figure, one will stay fixed, other will be rotated

    useEffect( () => {

        if( !threeCBs ) return;

	const geom = new THREE.RingGeometry( innerRadius, outerRadius, thetaSegments );

        const mesh = new THREE.Mesh( geom, figureMaterial );
        
        threeCBs.add( mesh );
        setFigureMesh( mesh );

        
        const newMesh = new THREE.Mesh();
        const newMat = mesh.material.clone();

        newMat.opacity = .35;
        newMat.transparent = true;
        newMesh.material = newMat;
        newMesh.geometry = mesh.geometry.clone();
        
        setFixedMesh( newMesh );

        threeCBs.add( newMesh );
	
        return () => {
            threeCBs.remove( mesh );                                     
            geom.dispose();

            threeCBs.remove( newMesh );
            newMat.dispose();
        }            
        
    }, [threeCBs] );

    //------------------------------------------------------------------------
    //
    // this sets up and displays the orange rotation arrow
    
    useEffect( () => {

        if(!threeCBs) {
            setRotatedArrowMesh(null);
            return;
        }

        if( curAngle === 0) {
            setRotatedArrowMesh(null);
            return;
        }


        const raGeom = rotatedArrowheadGeom({angle: curAngle,					   
                                             x: rotatedArrowPt.x,
                                             y: rotatedArrowPt.y,
                                             reversed: (curAngle < 0)});

        const raMesh = new THREE.Mesh( raGeom, rotatedArrowMaterial );

	threeCBs.add(raMesh);
	setRotatedArrowMesh( raMesh );

        return () => {
            threeCBs.remove(raMesh);
            raMesh.geometry.dispose();
        };
        
    }, [curAngle, threeCBs, rotatedArrowPt]);
    
    
    // passed to ClickablePlaneComp
    const clickCB = useCallback( (pt) => {

        setRotatedArrowPt( pt );      
        
    }, [] );

    const curAngleCB = useCallback( (value) =>  {

        const newAngle = degToRad( normalizeAngleDeg(value) ) ;
       
        setCurAngle( newAngle );
        
    }, [] );


    // called when 'Rotate' button is clicked       
    
    const rotateCB = useCallback( () => {

        if( !figureMesh || !fixedMesh || !threeCBs ) {           
            return;
        }

        const tl = gsap.timeline({
            onStart: () => {
                setAnimating(true);
            },
            onComplete: () => {
                setAnimating(false);                         
            }
        });

        const reflectionDuration = .5;
        const textFadeDuration = .25;       
        const textDisplayDuration = .5;

	//console.log(curAngle);
                      
        tl.add(gsapRotate({ mesh: figureMesh,
                            angle: curAngle,
                            delay: 0,
                            renderFunc: threeCBs.render,                             
                            duration: reflectionDuration }));        
            
        tl.add(gsapTextAnimation({ parentNode: document.body,
                                   style:textDisplayStyle,
                                   entrySide: 'left',
				   duration: textFadeDuration,
				   displayTime: textDisplayDuration,
                                   text: 'symmetry!',
				   ease:'sine'}));
            
        // user has already found this angle 
        if( rotationInArray( symmFoundArray, curAngle ) >= 0 ) {
            return;
        }

	setSymmFoundArray( curArr => [...curArr, curAngle] );

        
    }, [threeCBs, figureMesh, fixedMesh, curAngle, symmFoundArray] );


    let symmLinesFoundDisplay = symmFoundArray.length.toString();
    
    return (

    	<FullScreenBaseComponent fonts={fonts}>

          <ThreeSceneComp ref={threeSceneRef} initCameraData={cameraData.current} />         

            
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
            
            <div  css={{ padding: '.75em',
                         display: 'flex',
                         justifyContent: 'space-around',
                         alignItems: 'center'}}>
              <span css={{
                  marginRight: '.5em'}}>
                <Button onClickFunc={ rotateCB }
                        active={!animating}>
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
          </div>
                  
          <div css={{
              position: 'absolute',
              bottom: '7%',
              left: '5%',
              fontSize: '1.75em',
              backgroundColor: 'white',
              padding: '.5em'
          }}>
            Nonzero rotational symmetries found: {symmLinesFoundDisplay}
          </div>

          <ClickablePlaneComp threeCBs={threeCBs}                           
                              clickCB={clickCB}
                              paused={animating}/>
          
        </FullScreenBaseComponent>
    );
}



function round(x, n = 3) {

    // x = -2.336596841557143
    
    return Math.round( x * Math.pow(10, n) )/Math.pow(10, n); 
    
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

// arr is an array of angles, rotation is an angle
// returns -1 if angle is not in arr, up to epsilon
function rotationInArray( arr, rotation ) {

    let foundAt = -1;

    arr.map( (m,index) => {

        if(  Math.abs( (m % 360) - (rotation % 360) ) < EPSILON ) foundAt = index;
                
    });

    return foundAt;
}
