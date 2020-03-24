import * as THREE from 'three';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// func: f(x,y) = z
export default function FunctionGraph({ func, xMin, xMax, yMin, yMax,
					meshSize = 100, color = '#9C27B0' }) {    

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    const material = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    material.shininess = 0;
    material.wireframe = false;
   
    const funcGeom = new THREE.ParametricBufferGeometry( (u,v, vect) => 
	                                                 vect.set(u, v, func(u*xRange + xMin,
                                                                             v*yRange + yMin) ),
                                                         meshSize, meshSize);
    funcGeom.translate( -.5, -.5, 0 );
    funcGeom.scale( xRange, yRange, 1 );
    funcGeom.translate( xMin + xRange/2, yMin + yRange/2, 0 );
    
    const mesh = new THREE.Mesh( funcGeom, material );  

    function getMesh() {
	return mesh;
    }

    function dispose() {
	material.dispose();
	funcGeom.dispose();
    }
    
    return {getMesh, dispose};
};


