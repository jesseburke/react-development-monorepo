import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

import Button from './ButtonWithActiveState.jsx';

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = 0.35;
fixedMaterial.transparent = true;

const defaultDrawingAtom = atom(true);

function FreeDrawComp(
    { startingGeom = null, transforms = [], activeAtom = defaultDrawingAtom, threeCBs },
    ref
) {
    const drawing = useAtom(activeAtom)[0];

    const mainMeshRef = useRef(null);
    const fixedMeshRef = useRef(null);
    const freeDrawRef = useRef(null);

    //------------------------------------------------------------------------

    React.useImperativeHandle(ref, () => ({
        mainMesh: mainMeshRef.current,
        fixedMesh: fixedMeshRef.current
    }));

    const clearCB = useCallback(() => {
        if (freeDrawRef.current) {
            freeDrawRef.current.reset();
            //freeDrawRef.current = null;
        }

        if (mainMeshRef.current) {
            threeCBs.remove(mainMeshRef.current);
            mainMeshRef.current.geometry.dispose();
            mainMeshRef.current = null;
        }

        if (fixedMeshRef.current) {
            threeCBs.remove(fixedMeshRef.current);
            fixedMeshRef.current.geometry.dispose();
            fixedMeshRef.current = null;
        }
    }, [threeCBs, freeDrawRef, mainMeshRef, fixedMeshRef]);

    const doneCBs = [
        useCallback(
            (newMesh) => {
                if (!newMesh) return;

                if (!mainMeshRef.current) {
                    mainMeshRef.current = newMesh;
                    threeCBs.add(mainMeshRef.current);
                } else {
                    mainMeshRef.current.geometry = BufferGeometryUtils.mergeBufferGeometries(
                        [mainMeshRef.current.geometry, newMesh.geometry].filter((e) => e)
                    );
                }
                threeCBs.render();
            },
            [mainMeshRef, threeCBs]
        ),
        useCallback(
            (newMesh) => {
                if (!newMesh) return;

                if (!fixedMeshRef.current) {
                    fixedMeshRef.current = new THREE.Mesh();
                    fixedMeshRef.current.geometry = newMesh.geometry;
                    fixedMeshRef.current.material = fixedMaterial;
                    threeCBs.add(fixedMeshRef.current);
                } else {
                    fixedMeshRef.current.geometry = BufferGeometryUtils.mergeBufferGeometries(
                        [fixedMeshRef.current.geometry, newMesh.geometry].filter((e) => e)
                    );
                }
                threeCBs.render();
            },
            [fixedMeshRef, threeCBs]
        )
    ];

    // sets up FreeDraw
    useEffect(() => {
        if (!threeCBs) return;

        if (drawing) {
            freeDrawRef.current = FreeDrawFactory({
                threeCBs,
                startingGeom,
                material: freeDrawMaterial,
                transforms
            });
        } else {
            if (freeDrawRef.current) {
                freeDrawRef.current.dispose();
            }
            freeDrawRef.current = null;
        }

        return () => {
            if (freeDrawRef.current) {
                doneCBs.map((cb) => cb(freeDrawRef.current.getMesh()));
                freeDrawRef.current.dispose();
            }
        };
    }, [threeCBs, startingGeom, transforms, drawing, freeDrawRef]);

    return (
        <div className='absolute bottom-20 left-20 text-xl'>
            <div className='cursor-pointer'>
                {drawing ? <Button onClick={clearCB}>Clear Figure</Button> : null}
            </div>
        </div>
    );
}

export default React.forwardRef(FreeDrawComp);

function FreeDrawFactory({
    threeCBs,
    startingGeom = null,
    transforms = [],
    material = new THREE.MeshBasicMaterial({ color: 0xff00ff }),
    meshOptions = { tubularSegments: 128, radius: 0.15, radialSegments: 4, closed: false }
}) {
    const { getCanvas, add, remove, getMouseCoords } = threeCBs;

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

        // otherwise user clicked, and let up mouse, without moving.
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
