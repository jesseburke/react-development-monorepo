import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.jsx';

import Button from '../components/Button.jsx';

function GraphDrawComp({
    threeCBs,
    doneCBs = [() => null],
    transforms = [],
    material,
    clearCB,
    fontSize = '1em'
}) {
    const [graphDraw, setGraphDraw] = useState(null);

    const resetCB = useCallback(() => {
        if (graphDraw) graphDraw.reset();

        if (clearCB) clearCB();
    }, [graphDraw, clearCB]);

    const undoCB = useCallback(() => {
        graphDraw.undoLatest();
    }, [graphDraw]);

    // following sets up GraphDraw
    useEffect(() => {
        let gd;

        if (!threeCBs || !material) {
            setGraphDraw(null);
        } else {
            //console.log('GraphDrawFactory called with transforms = ', transforms);
            gd = GraphDrawFactory({ threeCBs, material, transforms });
            setGraphDraw(gd);
        }

        return () => {
            if (gd) {
                doneCBs.map((cb) => cb(gd.getMesh()));
                gd.dispose();
            }
        };
    }, [threeCBs, material, doneCBs]);

    return (
        <div
            css={{
                position: 'absolute',
                top: '90%',
                left: '10%',
                width: '80%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize
            }}>
            <div css={{ cursor: 'pointer' }}>
                <Button onClickFunc={resetCB}>Clear Figure</Button>
            </div>
            <div
                css={{
                    padding: '1%',
                    border: '1px',
                    borderStyle: 'solid',
                    borderRadius: '50%',
                    // next line stops cursor from changing to text selection on hover
                    cursor: 'pointer'
                }}
                onClick={undoCB}>
                <span css={{ padding: '.15em', fontSize: '2rem', userSelect: 'none' }}>
                    {'\u{270F}'}
                </span>
            </div>
        </div>
    );
}

export default React.memo(GraphDrawComp);

function GraphDrawFactory({
    threeCBs,
    transforms = [],
    material = new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    tubeGeometryOptions = { tubularSegments: 128, radius: 0.05, radialSegments: 4, closed: false },
    sphereGeometryOptions = { radius: 0.25, widthSegments: 32, heightSegments: 32 }
}) {
    const { getCanvas, add, remove, getMouseCoords } = threeCBs;
    const canvas = getCanvas();

    let lastPt;

    // these are the points that the user has actually clicked on
    let selectedPointArray = [];
    // these are selectedPointArray points, plus those resulting from transformations
    let curPointArray = [];

    let curTubeMeshArray = MeshArrayFactory([]);
    let curSphereMeshArray = MeshArrayFactory([]);
    let compMeshArray = MeshArrayFactory([]);

    // constants for the line mesh
    const { tubularSegments, radius: lineRadius, radialSegments, closed } = tubeGeometryOptions;

    // constants for the sphere mesh
    const { radius: sphereRadius, widthSegments, heightSegments } = sphereGeometryOptions;

    // whether have to transform meshes as we create them
    const areTransforming = transforms.length > 0;
    //console.log('GraphDrawFactory; areTransforming is ', areTransforming);

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
        //console.log('mousedowncb');

        //console.log( 'e.clientX is ', e.clientX );
        //console.log( 'e.clientY is ', e.clientY );

        let newPt = getMouseCoords(e, planeMesh);

        //console.log( 'newPt is ', newPt );
        //console.log( 'lastPt is ', lastPt );

        //------------------------------------------------------------------------
        //
        // see if point clicked on is within epsilon of any of the points that already exist
        // in array; will not draw new sphere if so

        const repeatedPt = curPointArray.find((p) => vecEqual(newPt, p));

        if (repeatedPt) {
            //console.log('user has clicked on current vertex');

            // user has clicked on same point twice; this ends the component
            if (repeatedPt === lastPt) {
                lastPt = null;

                const newCompMesh = curTubeMeshArray.combine();
                compMeshArray.add(newCompMesh);
                threeCBs.add(newCompMesh);

                curTubeMeshArray.dispose(threeCBs.remove);

                return;
            } else newPt = repeatedPt;
        }

        selectedPointArray.push(newPt);
        curPointArray.push(newPt);

        if (areTransforming) {
            const newCopies = transforms.map((t) => t.transformPoint(newPt));
            //console.log('newCopies in pt part is ', newCopies );
            newCopies.forEach((pt) => curPointArray.push(pt));
            //console.log('curPointArray is ', curPointArray );
        }

        // add a sphere at the point clicked on
        let sphereGeom = new THREE.SphereBufferGeometry(
            sphereRadius,
            widthSegments,
            heightSegments
        );

        sphereGeom.translate(newPt.x, newPt.y, 0);

        if (areTransforming) {
            const newCopies = transforms.map((t) => t.transformGeometry(sphereGeom));
            newCopies.push(sphereGeom);

            sphereGeom = BufferGeometryUtils.mergeBufferGeometries(newCopies);
        }

        const sphereMesh = new THREE.Mesh(sphereGeom, material);
        threeCBs.add(sphereMesh);
        curSphereMeshArray.add(sphereMesh);

        // if lastPt is null, then this is the first point of the component,
        // so we return and don't add a tubemesh
        if (!lastPt) {
            lastPt = newPt;
            return;
        }

        // otherwise, make tube mesh, and add it to curTubeMeshArray
        let tubeGeom = new THREE.TubeBufferGeometry(
            new THREE.LineCurve3(newPt, lastPt),
            tubularSegments,
            lineRadius,
            radialSegments,
            closed
        );

        if (areTransforming) {
            const newCopies = transforms.map((t) => t.transformGeometry(tubeGeom));
            newCopies.push(tubeGeom);

            tubeGeom = BufferGeometryUtils.mergeBufferGeometries(newCopies);
        }

        const tubeMesh = new THREE.Mesh();
        tubeMesh.geometry = tubeGeom;
        tubeMesh.material = material;

        curTubeMeshArray.add(tubeMesh);
        threeCBs.add(tubeMesh);

        lastPt = newPt;
    }

    canvas.addEventListener('mousedown', mouseDownCB);

    //canvas.addEventListener( 'mouseleave', mouseUpCB );

    //--------------------------------------------------
    //
    // exports
    //
    //

    function undoLatest() {
        if (!lastPt) return;

        const tMesh = curTubeMeshArray.pop();
        const sMesh = curSphereMeshArray.pop();

        threeCBs.remove(tMesh);
        threeCBs.remove(sMesh);

        if (tMesh) tMesh.geometry.dispose();
        if (sMesh) sMesh.geometry.dispose();

        // get rid of latest point
        selectedPointArray.pop();

        if (selectedPointArray.length === 0) {
            lastPt = null;
            return;
        }

        lastPt = selectedPointArray[selectedPointArray.length - 1];
    }

    function dispose() {
        canvas.removeEventListener('mousedown', mouseDownCB);

        curTubeMeshArray.dispose(remove);
        curSphereMeshArray.dispose(remove);
        compMeshArray.dispose(remove);

        material.dispose();
        remove(planeMesh);
    }

    function getMesh() {
        compMeshArray.add(curTubeMeshArray.combine());
        compMeshArray.add(curSphereMeshArray.combine());

        return compMeshArray.combine();
    }

    function reset() {
        lastPt = null;

        compMeshArray.dispose(remove);
        compMeshArray = MeshArrayFactory([]);

        curTubeMeshArray.dispose(remove);
        curTubeMeshArray = MeshArrayFactory([]);

        curSphereMeshArray.dispose(remove);
        curSphereMeshArray = MeshArrayFactory([]);

        selectedPointArray = [];
        curPointArray = [];
    }

    return { dispose, getMesh, reset, undoLatest };
}

function MeshArrayFactory({ startingArray = [] }) {
    let meshArray = startingArray;

    function add(mesh) {
        if (!mesh) return;

        meshArray.push(mesh);
    }

    function combine() {
        // in case any null objects slipped in, filter them out
        meshArray.filter((m) => m.isMesh);

        // if no meshes, return
        if (meshArray.length === 0) return null;

        const material = meshArray[0].material;

        const geometry = BufferGeometryUtils.mergeBufferGeometries(
            meshArray.map((m) => m.geometry)
        );

        return new THREE.Mesh(geometry, material);
    }

    function dispose(disposeCB) {
        meshArray.forEach((m) => {
            disposeCB(m);
            m.geometry.dispose();
        });
    }

    const pop = () => meshArray.pop();

    const last = () => meshArray[meshArray.length - 1];

    return { add, combine, dispose, pop, last };
}

function round(x, n = 3) {
    // x = -2.336596841557143

    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}

function vecEqual(v1, v2) {
    const EPSILON = 0.3;

    if (!v1 || !v2) return false;

    if (v1.distanceTo(v2) < EPSILON) return true;

    return false;
}
