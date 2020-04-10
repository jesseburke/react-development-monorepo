import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export default function use3DAxes({ threeCBs,
				    length,
				    radius = .05,
				    color,
				    show,
				    showLabels,
				    xLabel = 'x',
				    yLabel = 'y',
				    zLabel = 'z',
				    labelStyle,
				    tickDistance = 1,
				    tickRadius = 2.5,
				    tickColor = '#8BC34A',
				    })

{
    
    useEffect( () => {

	if( !threeCBs ) return;

	// this will hold axes and all adornments
	const axesGroup = new THREE.Group();
	
	if( show ) {       
		    
	    // make two axes first
	    const material = new THREE.LineBasicMaterial( {
		color: color,
		linewidth: 100,          
	    } );

	    const radiusTop = radius;
	    const radiusBottom = radius;
	    let height = 2*length;
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

	    const axesMaterial = new THREE.MeshBasicMaterial({color: color});

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

	    for (let i = 1; i <= length; i++) {
		geomArray.push(RawTickGeometry( radius*tickRadius)
			       .translate( i, 0, 0));
		geomArray.push(RawTickGeometry( radius*tickRadius)
			       .translate(-i, 0, 0));
		geomArray.push(RawTickGeometry( radius*tickRadius)
			       .translate( 0, i, 0));
		geomArray.push(RawTickGeometry( radius*tickRadius)
			       .translate( 0,-i, 0));
		geomArray.push(RawTickGeometry( radius*tickRadius)
			       .translate( 0, 0, i));
		geomArray.push(RawTickGeometry( radius*tickRadius)
			       .translate( 0, 0,-i));    
	    }    

	    let axesGeom = BufferGeometryUtils.mergeBufferGeometries(
		geomArray );

	    // am not using tickColor right now
	    const tickMaterial = new THREE.MeshBasicMaterial({color: color});
	    
	    axesGroup.add( new THREE.Mesh( axesGeom, tickMaterial ) );

	    threeCBs.add( axesGroup );
	}
	
	return () => {
	    if( axesGroup ) {
		threeCBs.remove(axesGroup);
	    }
	};
	
    }, [threeCBs, show, radius, length,
	radius, tickRadius, color] );

    useEffect( () => {

	if( !threeCBs ) return;
	
	let xLabelID; 
	let yLabelID; 
	let zLabelID;

	if (showLabels) {
	               
            xLabelID = threeCBs.addLabel({ pos: [length, 0, 0],
					   text: xLabel,
					   style: labelStyle });

            yLabelID = threeCBs.addLabel({ pos: [0, length, 0],
                                           text: yLabel,
                                           style: labelStyle });

            zLabelID = threeCBs.addLabel({ pos: [0, 0, length],
                                           text: zLabel,
                                           style: labelStyle });

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
	
    }, [threeCBs, showLabels, length, labelStyle] );

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

