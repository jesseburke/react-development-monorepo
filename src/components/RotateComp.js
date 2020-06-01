import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import ClickablePlaneComp from '../components/ClickablePlaneComp.js';
//import Input from '../components/Input.js';
import {Input} from '@jesseburke/basic-react-components';
import Button from '../components/Button.js';

import {rotatedArrowheadMesh} from '../graphics/RotatedArrowhead.js';
import OriginHalfLine from '../graphics/OriginHalfLine.js';

//------------------------------------------------------------------------
//
// constants

const rotateLineColor =  'rgb(231, 71, 41)';

const startPt = {x: 2.5, y: 0};

export default function RotateComp({ resetCB,
                                     threeCBs,
                                     curAngle,
                                     animating}) {

    const [lineMesh, setLineMesh] = useState(null);
    const [rotatedArrowMesh, setRotatedArrowMesh] = useState(null);

    const [rotatedArrowPt, setRotatedArrowPt] = useState(startPt);

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

        const raMesh = rotatedArrowheadMesh({angle: curAngle,
					     color: rotateLineColor,
                                             x: rotatedArrowPt.x,
                                             y: rotatedArrowPt.y,
                                             reversed: (curAngle < 0)});

	threeCBs.add(raMesh);
	setRotatedArrowMesh( raMesh );

        return () => {
            threeCBs.remove(raMesh);
            raMesh.geometry.dispose();
            raMesh.material.dispose();
        };
        
    }, [curAngle, threeCBs, rotatedArrowPt]);


     // passed to ClickablePlaneComp
    const clickCB = useCallback( (pt) => {

        setRotatedArrowPt( pt );      
        
    }, [] );

 
            
    
    return (
        <div>         
          
          <div css={{
              position: 'absolute',
              top: '90%',
              left: '5%',            
              fontSize: '1.25em',
              cursor:'pointer'}}>                              
            <Button onClickFunc={resetCB}>
              Back to drawing            
            </Button>          
          </div>
          
         
          
          <ClickablePlaneComp threeCBs={threeCBs}                           
                              clickCB={clickCB}
                              paused={animating}/>
        </div>
    );
    
}



const radToDeg = (rad) => (rad * 57.2958);

function round(x, n = 3) {

    // x = -2.336596841557143
    
    return Math.round( x * Math.pow(10, n) )/Math.pow(10, n); 
    
}
