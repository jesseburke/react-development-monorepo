import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// vec1 and vec2 are Three.Vector3's, with z component assumed to be 0
//
// the line has direction: from vec2 to vec1
//

export default function ReflectionFactory( line ) {

    if( !line ) {
	return;
    }

    // in future will add in appropriate translations to suppport reflection about arbitrary lines
    
    // pure; returns new THREE.Vector3

    function transformPoint(pt) {

	const newPt = pt.clone();

	newPt.applyAxisAngle( line.getDirection(), Math.PI );

	return newPt;		
    }

    // pure; returns new geometry

    function transformGeometry(geom) {

	let emptyObj = new THREE.Object3D();
	emptyObj.rotateOnWorldAxis( line.getDirection(), Math.PI );
	//let qEnd = emptyObj.quaternion;

	const newGeom = geom.clone();
	const angle = line.getAngle();
	
	newGeom.rotateZ( -angle );
	newGeom.rotateX( Math.PI );
	newGeom.rotateZ( angle );

	
	return newGeom;
	
    }

    // pure; returns new mesh

    function transformMesh(mesh) {

	return mesh.clone();
	
    }


    return {transformPoint, transformMesh, transformGeometry};
    
}
    
