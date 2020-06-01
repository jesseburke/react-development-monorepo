import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// vec1 and vec2 are Three.Vector3's, with z component assumed to be 0
//
// the line has direction: from vec2 to vec1
//

export default function LineFactory( vec1, vec2 = new THREE.Vector3(0,0,0), roundPlace = 2 ) {

    if( vec1.x === vec2.x && vec1.y === vec2.y ) {

	console.log('LineFactory called with two points equal to each other, or with only point that was zero');
	return null;
    }
    
    // in radians, between 0 and Math.PI
    function getAngle() {

	return (Math.atan2( vec2.y - vec1.y, vec2.x - vec1.x ) + Math.PI) % Math.PI;
	
    }

    function getDirection() {

	const newVec = (new THREE.Vector3()).copy(vec2);

	newVec.sub( vec1 );

	return newVec.normalize();
    }

    // equation will be of the form ay = bx + c
    // returns object with keys 'y', 'x', 'const'
    
    function getEquation() {

	const a = vec2.x - vec1.x;
	const b = vec2.y - vec1.y;
	const c = vec1.y*(vec2.x - vec1.x) - vec1.x*(vec2.y - vec1.y);

	if( a === 0 ) {

	    // are assuming that b is nonzero, if a is zero
	    return {x: 1, y: 0, const: c/b};
	}

	return {y: 1, x: round(b/a, roundPlace), const: round(c/a, roundPlace)}; 	
    }

    function getSlope() {

	if( vec1.x === vec2.x ) return Infinity;

	return ((vec1.y-vec2.y)/(vec1.x-vec2.y));
	
    }

    function isVertical() {

	return (vec1.x === vec2.x);
	
    }

    function containsOrigin() {

	return (getEquation().const === 0);

    }
    

    function angleWithinEpsilon( line, epsilon ) {

	if( !line.getAngle() ) {
	    //console.log( 'angleWithinEpsilon was called with line.getAngle() null (line is first argument to withinEpsilon)' );
	    return false;
	}
	
	return Math.abs(getAngle()-line.getAngle()) < epsilon;

    }

    function slopeWithinEpsilon( line, epsilon ) {

	if( !line.getSlope() ) {
	    //console.log( 'slopeWithinEpsilon was called with line.getSlope() null (line is first argument to withinEpsilon)' );
	    return false;
	}

	const m1 = getSlope();
	const m2 = line.getSlope();

	if( epsilon === 0 ) {
	    return (m1 === m2);
	}
	
	else if ( !(isFinite(m1)) ) {
	    return (Math.abs(m2) > 1/epsilon);
	}

	else if ( !(isFinite(m2)) ) {
	    return (Math.abs(m1) > 1/epsilon);
	}
			
	return ( Math.abs( m1 - m2 ) < epsilon );

    }

    function makeGeometry({radius = .02, length = 100, tubularSegments = 64, radialSegments = 4} = {}) {

	const newVec = new THREE.Vector3().copy(vec1);
	newVec.multiplyScalar( length );    

	// make the line geometry; goes two directions from origin
	const geometry = BufferGeometryUtils.mergeBufferGeometries(
	    [
		new THREE.TubeBufferGeometry(
                    new THREE.LineCurve3(newVec, vec2 ),
                    tubularSegments,
                    radius,
                    radialSegments
		),
		new THREE.TubeBufferGeometry(
                    new THREE.LineCurve3( newVec.multiplyScalar(-1), vec2 ),
                    tubularSegments,
                    radius,
                    radialSegments
		)
            ]
	);

	return geometry;
	
    }


    return {getAngle, getDirection, getEquation, getSlope,
	    containsOrigin, isVertical, angleWithinEpsilon,
	    slopeWithinEpsilon, makeGeometry};
    
}

export function OriginLineFromSlope( m ) {
    
    if( m === Infinity || m === -Infinity )
	return LineFactory( new THREE.Vector3( 0, 1, 0 ) );

    return LineFactory( new THREE.Vector3( 1, m, 0 ) );

}

function round(x, n = 3) {

    // x = -2.336596841557143
    
    return Math.round( x * Math.pow(10, n) )/Math.pow(10, n); 
    
}
    
