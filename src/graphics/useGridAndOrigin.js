import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import GridHelper from '../graphics/GridHelper.js';

export default function useGridAndOrigin({ threeCBs, gridData: {bounds, show, originColor}, originRadius = .25, gridCB }) {
    
    useEffect( () => {

	const {xMin, xMax, yMin, yMax} = bounds;

        if( !threeCBs || !show) return;

	if( xMax < xMin ) {
	    console.log('useGridAndOrigin called with xMax < xMin');
	    return;
	}

	if( yMax < yMin ) {
	    console.log('useGridAndOrigin called with yMax < yMin');
	    return;
	}

	const grid = GridHelper({ xMin, xMax, yMin, yMax }); 	
	
        grid.material.opacity = .4;
        grid.material.transparent = true;

        threeCBs.add( grid );

	if( gridCB ) gridCB(grid);
        
        const geometry = new THREE.SphereBufferGeometry( originRadius, 15, 15 );
        const material = new THREE.MeshBasicMaterial({ color: originColor });

        const origin = new THREE.Mesh( geometry, material );
        threeCBs.add( origin );      	
        
        return () => {
            if( grid ) threeCBs.remove( grid );
            threeCBs.remove( origin );
            geometry.dispose();
            material.dispose();
        };
        
    }, [threeCBs, bounds, show, originColor] );
    
}
