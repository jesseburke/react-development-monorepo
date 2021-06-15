import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.jsx';

import Button from '../components/Button.jsx';

export default function FreeDrawComp({
    threeCBs,
    startingGeom = null,
    doneCBs = [() => null],
    transforms = [],
    material,
    clearCB,
    fontSize = '1.25em'
}) {
    const [freeDraw, setFreeDraw] = useState(null);

    const resetCB = useCallback(() => {
        if (freeDraw) freeDraw.reset();

        if (clearCB) clearCB();
    }, [freeDraw, clearCB]);

    // following sets up FreeDraw
    useEffect(() => {
        let fd;

        if (!threeCBs || !material) {
            setFreeDraw(null);
        } else {
            fd = FreeDrawFactory({ threeCBs, startingGeom, material, transforms });
            setFreeDraw(fd);
        }
        // minus is clockwise
        return () => {
            if (fd) {
                doneCBs.map((cb) => cb(fd.getMesh()));
                fd.dispose();
            }
        };
    }, [threeCBs, material, startingGeom, transforms]);

    return (
        <div
            css={{
                position: 'absolute',
                top: '90%',
                left: '10%',
                fontSize
            }}
        >
            <div css={{ cursor: 'pointer' }}>
                <Button onClickFunc={resetCB}>Clear Figure</Button>
            </div>
        </div>
    );
}

function FreeDrawFactory({
    threeCBs,
    startingGeom = null,
    transforms = [],
    material = new THREE.MeshBasicMaterial({ color: 0xff00ff }),
    meshOptions = { tubularSegments: 128, radius: 0.15, radialSegments: 4, closed: false }
}) {
    const { getCanvas, add, remove } = threeCBs;
    const getMouseCoords = threeCBs.getMouseCoords;

    const canvas = getCanvas();

    let areDrawing = false;

    let curPointArray = [];

    let curGeomArray = [];
    let curMeshArray = [];
    let compGeomArray = [];
    let compMeshArray = [];

    if (startingGeom) compGeomArray = [startingGeom];

    let totalGeom;

    // constants for the curve geometry
    const { tubularSegments, radius, radialSegments, closed } = meshOptions;

    // whether have to transform meshes as we create them
    const areTransforming = transforms.length > 0;

    //------------------------------------------------------------------------
    //
    // this is a transparent plane, used for mouse picking

    const planeGeom = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
    const planeMat = new THREE.MeshBasicMaterial({ color: 'rgba(100, 100, 100, 1)' });

    planeMat.transparent = true;
    planeMat.opacity = 0.0;
    planeMat.side = THREE.DoubleSide;
    planeMat.depthWrite = false;

    const planeMesh = new THREE.Mesh(planeGeom, planeMat);

    add(planeMesh);

    //------------------------------------------------------------------------

    function mouseDownCB(e) {
        areDrawing = true;
        curPointArray.push(getMouseCoords(e, planeMesh));
    }

    let curPoint;

    function mouseMoveCB(e) {
        if (!areDrawing) return;

        curPoint = getMouseCoords(e, planeMesh);
    }

    function animatedDrawing() {
        //requestAnimationFrame( animatedDrawing );

        setTimeout(animatedDrawing, 30);

        if (!areDrawing || !curPoint) return;

        curPointArray.push(curPoint);

        let curPath;
        const l = curPointArray.length;

        if (l === 2) {
            curPath = new THREE.LineCurve3(curPointArray[1], curPointArray[0]);
        } else if (l === 3) {
            curPath = new THREE.QuadraticBezierCurve3(
                curPointArray[2],
                curPointArray[1],
                curPointArray[0]
            );
        } else {
            curPath = new THREE.CatmullRomCurve3([
                curPointArray[l - 1],
                curPointArray[l - 2],
                curPointArray[l - 3]
            ]);
        }

        let curGeom = new THREE.TubeBufferGeometry(
            curPath,
            tubularSegments,
            radius,
            radialSegments,
            closed
        );
        if (areTransforming) {
            const newCopies = transforms.map((t) => t.transformGeometry(curGeom));
            newCopies.push(curGeom);

            curGeom = BufferGeometryUtils.mergeBufferGeometries(newCopies);
        }
        curGeomArray.push(curGeom);

        const curMesh = new THREE.Mesh(curGeom, material);
        curMeshArray.push(curMesh);
        add(curMesh);
    }

    //requestAnimationFrame( animatedDrawing );

    setTimeout(animatedDrawing, 30);

    function mouseUpCB(e) {
        if (!areDrawing) return;

        // create this connected component's geometry from curGeomArray
        let curCompGeom;

        if (curGeomArray.length > 0) {
            curCompGeom = BufferGeometryUtils.mergeBufferGeometries(curGeomArray);

            // add it to the array of components
            compGeomArray.push(curCompGeom);

            // dispose of the older geometries and meshes
            curGeomArray.forEach((g) => {
                g.dispose();
            });

            curMeshArray.forEach((m) => remove(m));

            const curCompMesh = new THREE.Mesh(curCompGeom, material);
            compMeshArray.push(curCompMesh);
            add(curCompMesh);
        }

        // otherwise user clicked, and let up mouse, without moving
        // add a sphere at the clicked point, in this case
        else {
            const pt = getMouseCoords(e, planeMesh);

            curCompGeom = new THREE.SphereBufferGeometry(radius, 15, 15).translate(pt.x, pt.y, 0);

            if (areTransforming) {
                const newCopies = transforms.map((t) => t.transformGeometry(curCompGeom));
                newCopies.push(curCompGeom);

                curCompGeom = BufferGeometryUtils.mergeBufferGeometries(newCopies);
            }

            compGeomArray.push(curCompGeom);

            const curCompMesh = new THREE.Mesh(curCompGeom, material);
            compMeshArray.push(curCompMesh);
            add(curCompMesh);
        }

        curPointArray = [];
        curGeomArray = [];
        curMeshArray = [];
        curPoint = null;
        areDrawing = false;
    }

    canvas.addEventListener('mousedown', mouseDownCB);
    canvas.addEventListener('mousemove', mouseMoveCB);

    canvas.addEventListener('mouseup', mouseUpCB);
    //canvas.addEventListener( 'mouseleave', mouseUpCB );

    //--------------------------------------------------
    //
    // exports
    //
    //

    function dispose() {
        canvas.removeEventListener('mousedown', mouseDownCB);
        canvas.removeEventListener('mousemove', mouseMoveCB);
        canvas.removeEventListener('mouseup', mouseUpCB);
        canvas.removeEventListener('mouseleave', mouseUpCB);

        if (totalGeom) totalGeom.dispose();
        compGeomArray.filter((g) => g.dispose).forEach((g) => g.dispose());
        compMeshArray.filter((m) => m.remove).forEach((m) => remove(m));
        material.dispose();
        remove(planeMesh);
    }

    function getMesh() {
        // removes any undefined entries
        compGeomArray = compGeomArray.filter((g) => g);

        if (compGeomArray.length == 0) {
            return undefined;
        }

        totalGeom = BufferGeometryUtils.mergeBufferGeometries(compGeomArray);

        return new THREE.Mesh(totalGeom, material);
    }

    function reset() {
        compMeshArray.forEach((m) => remove(m));

        compGeomArray.forEach((g) => g.dispose());

        curPointArray = [];
        curGeomArray = [];
        curMeshArray = [];
        compGeomArray = [];
        compMeshArray = [];
    }

    return { dispose, getMesh, reset };
}
