import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import ClickablePlaneComp from '../components/ClickablePlaneComp.js';
import Button from '../components/Button.js';

import ArrowGeometry from '../graphics/ArrowGeometry.js';

//------------------------------------------------------------------------
//
// constants

const translateLineColor =  'rgb(231, 0, 0)';

const startPt = new THREE.Vector2( 2.5, 0);

export default function TranslateComp({ resetCB, threeCBs,
                                        xCurTranslation,
                                        yCurTranslation,                                        
                                        animating}) {

    const [translationLineMesh, setTranslationLineMesh] = useState(null);
    const [translationPt, setTranslationPt] = useState( startPt );

    // this setsup and displays the orange translation arrow 
    useEffect( () => {

        if(!threeCBs) {
            setTranslationLineMesh(null);
            return;
        }

        const vec = new THREE.Vector2(xCurTranslation, yCurTranslation);
        const translationL = vec.length();

        
        // the arrow is parallel to y-axis at this point, is why pi/2
        const geometry = ArrowGeometry({ length: translationL }).rotateZ(vec.angle()-Math.PI/2);

        geometry.translate( translationPt.x, translationPt.y, translationPt.z );

        const material = new THREE.MeshBasicMaterial({ color: translateLineColor, opacity: 1 });

        const mesh = new THREE.Mesh( geometry, material );      
        //const mesh = new THREE.Mesh( ah, material );
        
        setTranslationLineMesh(mesh);
        threeCBs.add( mesh );


        return () => {
            threeCBs.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        };
        
    }, [threeCBs, xCurTranslation, yCurTranslation, translationPt]);

    

    
    // passed to ClickablePlaneComp
    const clickCB = useCallback( (pt) => {

        setTranslationPt( pt );      
        
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


// util functions

const radToDeg = (rad) => (rad * 57.2958);

function round(x, n = 3) {

    // x = -2.336596841557143
    
    return Math.round( x * Math.pow(10, n) )/Math.pow(10, n); 
    
}
