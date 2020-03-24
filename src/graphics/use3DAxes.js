import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export default function use3DAxes({ threeCBs, axesData = {length,
							  radius,
							  color,
							  show,
							  showLabels,
							  tickDistance: 1,
							  tickRadius: 1.25,
							  tickColor: '#8BC34A',
							  labelStyle} })

{
    
    useEffect( () => {

	if( !threeCBs ) return;

	// this will hold axes and all adornments
	const axesGroup = new THREE.Group();
	
	if( axesData.show ) {       
		    
	    // make two axes first
	    const material = new THREE.LineBasicMaterial( {
		color: axesData.color,
		linewidth: 100,          
	    } );

	    const radiusTop = axesData.radius;
	    const radiusBottom = axesData.radius;
	    let height = 2*axesData.length;
	    let radialSegments = 8;
	    let heightSegments = 40;
	    let openEnded = true;   

	    
	    const xa = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom,
							height, radialSegments,
							heightSegments,
							openEnded);
	    xa.rotateZ(Math.PI/2);
	    
	    const ya = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom,
							height, radialSegments,
							heightSegments,
							openEnded);

	    const axesMaterial = new THREE.MeshBasicMaterial({color: axesData.color});

	    const za = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom,
							height, radialSegments,
							heightSegments,
							openEnded);
	    za.rotateX(Math.PI/2);   

	    axesGroup.add(new THREE.Mesh(xa, axesMaterial));
	    axesGroup.add(new THREE.Mesh(ya, axesMaterial));
	    axesGroup.add(new THREE.Mesh(za, axesMaterial));

	    // make ticks now   

	    let geomArray = [];

	    for (let i = 1; i <= axesData.length; i++) {
		geomArray.push(RawTickGeometry( axesData.radius*axesData.tickRadius)
			       .translate( i, 0, 0));
		geomArray.push(RawTickGeometry( axesData.radius*axesData.tickRadius)
			       .translate(-i, 0, 0));
		geomArray.push(RawTickGeometry( axesData.radius*axesData.tickRadius)
			       .translate( 0, i, 0));
		geomArray.push(RawTickGeometry( axesData.radius*axesData.tickRadius)
			       .translate( 0,-i, 0));
		geomArray.push(RawTickGeometry( axesData.radius*axesData.tickRadius)
			       .translate( 0, 0, i));
		geomArray.push(RawTickGeometry( axesData.radius*axesData.tickRadius)
			       .translate( 0, 0,-i));    
	    }    

	    let axesGeom = BufferGeometryUtils.mergeBufferGeometries(
		geomArray );

	    // am not using tickColor right now
	    const tickMaterial = new THREE.MeshBasicMaterial({color: axesData.color});
	    
	    axesGroup.add( new THREE.Mesh( axesGeom, tickMaterial ) );

	    threeCBs.add( axesGroup );
	}
	
	return () => {
	    if( axesGroup ) {
		threeCBs.remove(axesGroup);
	    }
	};
	
    }, [threeCBs, axesData.show, axesData.radius, axesData.length,
	axesData.radius, axesData.tickRadius, axesData.color] );

    useEffect( () => {

	if( !threeCBs ) return;
	
	let xLabelID; 
	let yLabelID; 
	let zLabelID;

	if (axesData.showLabels) {
	               
            xLabelID = threeCBs.addLabel({ pos: [axesData.length, 0, 0],
					   text: "x",
					   style: axesData.labelStyle });

            yLabelID = threeCBs.addLabel({ pos: [0, axesData.length, 0],
                                           text: "y",
                                           style: axesData.labelStyle });

            zLabelID = threeCBs.addLabel({ pos: [0, 0, axesData.length],
                                           text: "z",
                                           style: axesData.labelStyle });

	    threeCBs.drawLabels();
	    threeCBs.render();
	}

	return () => {

	    if( xLabelID ) {
		threeCBs.removeLabel(xLabelID);
		xLabelID = null;
	    }
	    
	    if( yLabelID ) {
		threeCBs.removeLabel(yLabelID);
		yLabelID = null;
	    }

	    if( zLabelID ) {
		threeCBs.removeLabel(zLabelID);
		zLabelID = null;
	    }

	    threeCBs.drawLabels();
	};
	
    }, [threeCBs, axesData.showLabels, axesData.length, axesData.labelStyle] );

};

function RawTickGeometry(tickRadius) {

    const domeRadius = tickRadius;
    const domeWidthSubdivisions = 12;
    const domeHeightSubdivisions = 12;
    const domePhiStart = 0;
    const domePhiEnd = Math.PI * 2;
    const domeThetaStart = 0;
    const domeThetaEnd = Math.PI;
    
    return new THREE.SphereBufferGeometry(
        domeRadius, domeWidthSubdivisions, domeHeightSubdivisions,
        domePhiStart, domePhiEnd, domeThetaStart, domeThetaEnd);
}

