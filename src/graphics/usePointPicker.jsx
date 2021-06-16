import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

import { round } from '../utils/BaseUtils.js';

export default function usePointPicker({
    threeCBs,
    radius = 0.1,
    labelStyle = {
        color: 'black',
        padding: '.1em',
        margin: '.5em',
        padding: '.4em',
        fontSize: '1.5em'
    }
}) {
    useEffect(() => {
        if (!threeCBs) return;

        const planeGeom = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 'rgba(100, 100, 100, 1)' });

        mat.transparent = true;
        mat.opacity = 0.0;
        mat.side = THREE.DoubleSide;

        // this is a transparent plane, used for mouse picking
        const planeMesh = new THREE.Mesh(planeGeom, mat);
        threeCBs.add(planeMesh);

        let labelID = null;

        let pt = { x: 0, y: 0 };

        const pointGeom = new THREE.SphereBufferGeometry(radius, 15, 15);
        const pointMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const pointMesh = new THREE.Mesh(pointGeom, pointMat);

        function mouseDownCB(e) {
            const newPt = threeCBs.getMouseCoords(e, planeMesh);

            if (labelID) threeCBs.removeLabel(labelID);
            else threeCBs.add(pointMesh);

            labelID = threeCBs.addLabel({
                pos: [newPt.x, -newPt.y, 0],
                text:
                    '(' + round(newPt.x, 1).toString() + ', ' + round(-newPt.y, 1).toString() + ')',
                style: labelStyle
            });
            threeCBs.drawLabels();

            pointMesh.translateX(newPt.x - pt.x);
            pointMesh.translateY(-(newPt.y - pt.y));
            pt = newPt;

            threeCBs.render();

            console.log('mouseDown test');
            console.log(labelID);
        }

        threeCBs.getCanvas().addEventListener('mousedown', mouseDownCB);

        return () => {
            if (!threeCBs) return;

            threeCBs.getCanvas().removeEventListener('mousedown', mouseDownCB);
            threeCBs.remove(pointMesh);
            pointGeom.dispose();
            pointMat.dispose();
        };
    }, [threeCBs]);
    //------------------------------------------------------------------------
}
