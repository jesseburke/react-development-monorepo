import * as THREE from 'three';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// func: f(x,y) = z
export default function FunctionGraph2DGeom({ func,
					      bounds,
					      approxH = .1,
					      tubularSegments = 128,
                                              radius = .15,
                                              radialSegments = 4 }) {

    const {xMin, xMax, yMin, yMax} = bounds;

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    let pointArray = [];
    
    for( let i = Math.floor(xMin/approxH); i < Math.ceil(xMax/approxH); i++ ) {

        const t = func( i*approxH );

	//if( t <= 2*yMin || t >= 2*yMax ) break;
            
        pointArray.push( new THREE.Vector3(i*approxH, func( i*approxH ), 0) );

    }

    const geomArray = [];

   

    for( let i = 2; i < pointArray.length-1; i+= 2 ) {

	geomArray.push( new THREE.TubeBufferGeometry(
	    new THREE.CatmullRomCurve3( [pointArray[i], pointArray[i-1], pointArray[i-2]] ),
	    tubularSegments,
            radius,
            radialSegments,
	    false ) );	
        
    }

    return BufferGeometryUtils.mergeBufferGeometries(geomArray);
    
};


