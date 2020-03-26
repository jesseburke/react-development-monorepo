import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';
import * as THREE from 'three';



function DraggablePlaneComp({ threeCBs,                                       
                                             moveCB,
                                             paused,
                                             xSize = 1000,
                                             ySize = 1000,
                                             mesh }) {

    const [dragPlane, setDragPlane] = useState(null);       

    useEffect( () => {

        let cl;
        
        if( !threeCBs )
            setDragPlane(null);
        
        else {
            cl = DragPlane({ threeCBs, moveCB, mesh, xSize, ySize });
            setDragPlane( cl );
        }

        return () => {

            if( cl ) {
                cl.dispose();
            }
        };
        
    }, [threeCBs, moveCB] );

    useEffect( () => {

        if( !dragPlane ) {          
            return;
        }
        
        if( !paused ) {
            dragPlane.play();
            return;
        }

        else {
            dragPlane.pause();
        }

    }, [dragPlane, paused]);

            
    return null;
}


function DragPlane({ threeCBs, moveCB, mesh = null, xSize, ySize }) {

    if( !threeCBs ) return;

    const {getCanvas, add, remove, getMouseCoords} = threeCBs;
    const canvas = getCanvas();

    let areChoosing = true;
    let areDragging = false;
    let endPt;

    //------------------------------------------------------------------------
    //
    // this is a transparent plane, used for mouse picking
    
    const planeGeom = new THREE.PlaneBufferGeometry(xSize, ySize, 1, 1);
    const mat = new THREE.MeshBasicMaterial( {color: 'rgba(0, 0, 0, 1)'} );

    mat.transparent = true;
    mat.opacity = 0.0;
    mat.side = THREE.DoubleSide;
    //planeGeom.rotateX(Math.PI);

    let planeMesh;

    if( !mesh )
        planeMesh = new THREE.Mesh( planeGeom, mat );

    else
        planeMesh = mesh;

    add( planeMesh );
    //------------------------------------------------------------------------
      
    function handleDown(e) {
        
        if (!areChoosing) return;
        
        areDragging = true;

        canvas.addEventListener( 'pointermove', handleMove );
    }

    canvas.addEventListener( 'pointerdown', handleDown );
    

    function handleMove(e) {

        endPt =  getMouseCoords(e, planeMesh);
        
        moveCB( endPt );
        
    }

    function handleUp(e) {

        canvas.removeEventListener( 'pointermove', handleMove );
        
    }

    canvas.addEventListener( 'pointerup', handleUp );

    function dispose() {
        canvas.removeEventListener( 'pointerdown', handleDown );
        canvas.removeEventListener( 'pointerup', handleUp );

        if( planeGeom )
            planeGeom.dispose();

        if( mat )
            mat.dispose();

        if( planeMesh && threeCBs)
            remove(planeMesh);
    }

    function reset() {

    }


    function getPt() {
        return endPt;
    }

    function pause() {
        areChoosing = false;
    }

    function play() {
        areChoosing = true;
    }
    
    return {dispose, reset, getPt, pause, play};
}

export default React.memo( DraggablePlaneComp );
