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
        
    let compArray = [];
    let curArray = [];

    let pointArray = [];

    let ty;

    let x0, y0, x1, y1, m, tx, lastOutPt;
   
    for( let i = Math.floor(xMin/approxH); i < Math.ceil(xMax/approxH); i++ ) {

        ty = func( i*approxH );

	// if out of bounds, will try to add point on the boundary (but potentially off the x-grid)
	if( ty < yMin || ty > yMax ) {

	    // were out of bounds previous iteration, still out of bounds,
	    // so nothing to do
	    if( curArray.length === 0 ) {
		lastOutPt = [i*approxH, ty];
		continue;
	    }
	    
	    // otherwise, to draw equation until edge of bounds, will do linear
	    // approximation for the last bit

	    [x0, y0] = Vector3ToArray(curArray[curArray.length-1]);
	    [x1, y1] = [i*approxH, ty];	    

	    // x1 - x0 is nonzero by construction
	    m = (y1 - y0)/(x1-x0);

	    if( ty > yMax ) {
		tx = x0 + (yMax - y0)/m;
		curArray.push( new THREE.Vector3( tx, yMax, 0 ) );
		lastOutPt = [x1, y1];
	    }

	    else if( ty < yMin ) {
		tx = x0 + (yMin - y0)/m;
		curArray.push( new THREE.Vector3( tx, yMin, 0 ) );
		lastOutPt = [x1, y1];
	    }
	    
	    compArray.push( curArray );
	    curArray = [];
	    continue;
	}

	// if curArray is empty, then will add point on the boundary
	if( curArray.length === 0 && lastOutPt) {

	    [x0, y0] = lastOutPt;
	    [x1, y1] = [i*approxH, ty];

	    m = (y1 - y0)/(x1-x0);
	    
	    if( y0 > yMax ) {
		tx = x0 + (yMax - y0)/m;
		curArray.push( new THREE.Vector3( tx, yMax, 0 ) );
	    }

	    else if( y0 < yMin ) {
		tx = x0 + (yMin - y0)/m;
		curArray.push( new THREE.Vector3( tx, yMin, 0 ) );
	    }	    
	    
	}
	
        curArray.push( new THREE.Vector3(i*approxH, func( i*approxH ), 0) );

    }

    if( curArray.length > 0) compArray.push( curArray );

    const geomArray = [];

    let curve;
    
    for( let i = 0; i < compArray.length; i++ ) {

	curArray = compArray[i];
	curve = new THREE.CurvePath();

	for( let i = 0; i < curArray.length-1; i++ ) {
	    
	    curve.add( new THREE.LineCurve3( curArray[i], curArray[i+1] ) );
	    
	}
	
	geomArray.push( new THREE.TubeBufferGeometry(
	    curve,
	    1064,
	    radius,
	    radialSegments,
	    false ) );	
    }

    return BufferGeometryUtils.mergeBufferGeometries(geomArray);
    
};

function Vector3ToArray( v ) {

    return [v.x, v.y];
    
}
