import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// position is the radius of the circle this is a piece of
export function rotatedArrowheadGeom({ angle, meshRadius = .1, x = 3.5, y = -7.5, reversed = false }) {

    const tipLength = .6;
    const arrowAngle = Math.PI/4;

    const vec = new THREE.Vector2(x,y);
    const radius = vec.length();
    const vecAngle = vec.angle();
	
    const torusGeom = new THREE.TorusBufferGeometry( radius, meshRadius, 64, 64, angle );

    const tipGeom1 = (new THREE.CylinderBufferGeometry( meshRadius, meshRadius, tipLength ))
	  .translate(0, -tipLength/2, 0)
	  .rotateZ(-arrowAngle/2);
    const tipGeom2 = (new THREE.CylinderBufferGeometry( meshRadius, meshRadius, tipLength ))
	  .translate(0, -tipLength/2, 0)
	  .rotateZ(arrowAngle/2);
    const tipGeom = (BufferGeometryUtils.mergeBufferGeometries([ tipGeom1, tipGeom2 ]));

    let epsilon = 0;
    if (reversed) {
	tipGeom.rotateZ(Math.PI);
	epsilon = .1;
    }
    tipGeom.translate(0, tipLength/2, 0)
	.rotateZ( angle/(2) )
	.translate( radius*Math.cos( angle/2 - epsilon), radius*Math.sin(angle/2 - epsilon), 0)


    const geom = BufferGeometryUtils.mergeBufferGeometries([torusGeom, tipGeom]);

    geom.rotateZ( vecAngle );
	
    
    //const sphereGeom = new THREE.SphereBufferGeometry( .5 );
    //sphereGeom.translate( position*Math.cos( angle/2), position*Math.sin(angle/2), 0);	

    return geom;//BufferGeometryUtils.mergeBufferGeometries([torusGeom, tipGeom]);
	
    }

export function rotatedArrowheadMesh({ x, y,				       
				       angle,
				       meshRadius = .04,
				       color = 0xc14cc0,
				       reversed = false }) {

    const geom = rotatedArrowheadGeom({ x, y, angle, meshRadius, reversed });

	const material = new THREE.MeshBasicMaterial({ color, opacity: 1 });
        material.transparent = false;

	return new THREE.Mesh( geom, material );
    }

