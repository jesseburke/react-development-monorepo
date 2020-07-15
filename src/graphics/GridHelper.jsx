/**
 * @author mrdoob / http://mrdoob.com/
 */
// modified by jesseburke, to do rectangular grids, on Sept 22, 2019
// outputs grid in xy-plane

import * as THREE from 'three';

//import { LineSegments } from 'three/objects/LineSegments.js';
//import { VertexColors } from 'three/constants.js';
//import { LineBasicMaterial } from 'three/materials/LineBasicMaterial.js';
//import { Float32BufferAttribute } from 'three/core/BufferAttribute.js';
//import { BufferGeometry } from 'three/core/BufferGeometry.js';
//import { Color } from 'three/math/Color.js';

const VertexColors =  2;

export default function GridHelper( {  color = 0xcbcbcb,//0x444444,
				     xMin = -10, xMax = 10, yMin = -10, yMax = 10, step = 1} ) {

    color = new THREE.Color( color );    

    var vertices = [], colors = [];

    let k = 0;
    
    for(  let i = xMin; i <= xMax; i += step ) {
	for ( let j = yMin; j <= yMax; j += step ) {
	    vertices.push(xMin, j, 0, xMax, j, 0);
	    vertices.push(i, yMin, 0, i, yMax, 0);
	    //vertices.push(i,j,0);	  
	}
    }
    

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    //geometry.addAttribute( 'color', color );

    var material = new THREE.LineBasicMaterial( { color } );
    material.transparent = true;
    material.opacity = .4;

    return new THREE.LineSegments( geometry, material );
    
}

GridHelper.prototype = Object.assign( Object.create( THREE.LineSegments.prototype ), {

    constructor: GridHelper,

    copy: function ( source ) {

	THREE.LineSegments.prototype.copy.call( this, source );

	this.geometry.copy( source.geometry );
	this.material.copy( source.material );

	return this;

    },

    clone: function () {

	return new this.constructor().copy( this );

    }

} );

//export { GridHelper };
