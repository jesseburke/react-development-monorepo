import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import gsapRotate from '../animations/gsapRotate.js';

// returns a callback that expects a mesh argument; this will be added
//
// assumes that the mesh will always have the same material, and the user
// is responsible for disposing it

export default function useExpandingMesh({ startingMesh = null, threeCBs }) {

    const [mesh, setMesh] = useState(startingMesh);
    
    const [newMesh, setNewMesh] = useState(null);

    const expandCB = useCallback( (nm) => {
	
         setNewMesh(nm);
	 
     }, []);

    useEffect( () => {

        if( !newMesh || !threeCBs) return;
        
        const workingMesh = new THREE.Mesh();

        if( mesh ) {
            const newGeomArray = [mesh.geometry, newMesh.geometry ].filter( e => e );
            workingMesh.geometry = BufferGeometryUtils.mergeBufferGeometries( newGeomArray );
        }

        else { workingMesh.geometry = newMesh.geometry; }
        
        workingMesh.material = newMesh.material;
        
        setMesh( workingMesh );       
        threeCBs.add( workingMesh );

        // get rid of old mesh
        if( mesh ) {
            threeCBs.remove(mesh);
            mesh.geometry.dispose();
        }    
        
    }, [threeCBs, newMesh] );

    const getMesh = useCallback( () => mesh, [mesh] );

    const clear =  () => {

        if( mesh ) {
            threeCBs.remove(mesh);
            mesh.geometry.dispose();
        }

	setMesh(null);
	
    };

    return {expandCB, getMesh, clear};
    
}
