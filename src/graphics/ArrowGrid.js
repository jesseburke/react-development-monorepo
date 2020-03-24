import * as THREE from 'three';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import ArrowGeometry from './ArrowGeometry.js';

// arrowLength*aGridSqSize will be actual arrow length

export default function ArrowGrid( {gridSqSize,
				    color,
				    arrowLength,
				    bounds} = {}, func )
{
    const {xMin, xMax, yMin, yMax} = bounds;
    
    // returns array of two element arrays;
    // first element is standard coords (where arrow has length 1)
    // second element is scaled coords (where arrow has length
    // arrowLength)    
    
    const array = getPtsArray({ bounds, gridSqSize });

       
    const geomArray = array.map(
	([[x,y], [a,b]]) =>
	    {
		const slope = func(a,b);
		
		const theta = Math.asin( slope/Math.sqrt(slope*slope + 1) );
				     
		return (ArrowGeometry({ length: arrowLength })
			.rotateZ(theta-Math.PI/2).translate(x,y,0));
	    }
    );
       
    const geom = BufferGeometryUtils.mergeBufferGeometries(geomArray);    
    const c = gridSqSize;
    geom.scale(c,c,c);
    geom.translate(xMin, yMin, 0);
    
    const material = new THREE.MeshBasicMaterial({ color: color });
    //material.transparent = true;
    //material.opacity = .75;
    
    const mesh = new THREE.Mesh(geom, material);

    
    function getMesh() {
	return mesh;
     }

    function dispose() {	
	mesh.visible = false;
	material.dispose();
	geom.dispose();
    }

    return {dispose, getMesh}; 
}

// returns array of two element arrays; the first element is std
// coords, the second is scaled coords
function getPtsArray({  bounds: {xMin, xMax, yMin, yMax}, gridSqSize }) {

    const h = Math.ceil( (xMax - xMin) / gridSqSize );
    const v = Math.ceil( (yMax - yMin) / gridSqSize );

    const array = [];

    for( let i = 0; i < h; i++ ) {
	for( let j = 0; j <= v; j++ ) {
	    array.push([ [i,j], [i*gridSqSize+xMin,yMin+j*gridSqSize]
		       ]);	    
	}
    }

    return array;
    
}

// returns array of two element arrays; the first element is std
// coords, the second is scaled coords
function getPtsArrayOld( {quadSize, gridSqSize} ) {

    const n = Math.ceil( quadSize / gridSqSize );

    const h = gridSqSize;

    const array = [];

    for( let i = 0; i <= n; i++ ) {
	for( let j = 0; j <= n; j++ ) {
	    array.push([ [i,j], [i*gridSqSize,j*gridSqSize]
		       ]);
	    array.push([ [-i,j], [-i*gridSqSize,j*gridSqSize]
		       ]);
	    array.push([ [-i,-j], [-i*gridSqSize,-j*gridSqSize]
		       ]);
	    array.push([ [i,-j], [i*gridSqSize,-j*gridSqSize]
		       ]);	    
	}
    }

    return array;
    
}






