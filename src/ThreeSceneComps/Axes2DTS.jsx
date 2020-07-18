import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export default function Axes2DTS({
    threeCBs,
    bounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 },
    radius = 0.02,
    color = '#0A2C3C',
    show = true,
    showLabels = false,
    tickDistance = 1,
    tickRadius = 1.25,
    tickColor = '#8BC34A',
    labelStyle,
    xLabel = 'x',
    yLabel = 'y'
}) {
    const { xMin, xMax, yMin, yMax } = bounds;

    useEffect(() => {
        if (!threeCBs) return;

        // this will hold axes and all adornments
        const axesGroup = new THREE.Group();

        if (show) {
            // make two axes first

            const radiusTop = radius;
            const radiusBottom = radius;
            let radialSegments = 8;
            let heightSegments = 40;
            let openEnded = true;

            const xa = new THREE.CylinderBufferGeometry(
                radiusTop,
                radiusBottom,
                xMax - xMin,
                radialSegments,
                heightSegments,
                openEnded
            );
            xa.rotateZ(Math.PI / 2);
            xa.translate((xMax + xMin) / 2, 0, 0);

            const ya = new THREE.CylinderBufferGeometry(
                radiusTop,
                radiusBottom,
                yMax - yMin,
                radialSegments,
                heightSegments,
                openEnded
            );
            ya.translate(0, (yMax + yMin) / 2, 0);

            const axesMaterial = new THREE.MeshBasicMaterial({ color: color });
            //axesMaterial.transparent = true;
            //axesMaterial.opacity = .5;

            axesGroup.add(new THREE.Mesh(xa, axesMaterial));
            axesGroup.add(new THREE.Mesh(ya, axesMaterial));

            // make ticks now

            let geomArray = [];

            for (let i = xMin; i <= xMax; i++) {
                geomArray.push(RawTickGeometry(radius * tickRadius).translate(i, 0, 0));
            }

            for (let i = yMin; i <= yMax; i++) {
                geomArray.push(RawTickGeometry(radius * tickRadius).translate(0, i, 0));
            }

            let axesGeom = BufferGeometryUtils.mergeBufferGeometries(geomArray);

            // am not using tickColor right now
            const tickMaterial = new THREE.MeshBasicMaterial({ color: color });

            axesGroup.add(new THREE.Mesh(axesGeom, tickMaterial));

            threeCBs.add(axesGroup);
        }

        return () => {
            if (axesGroup) {
                threeCBs.remove(axesGroup);
            }
        };
    }, [threeCBs, show, xMin, xMax, yMin, yMax, radius, tickRadius, color]);

    useEffect(() => {
        if (!threeCBs) return;

        let xLabelID;
        let yLabelID;

        if (showLabels) {
            xLabelID = threeCBs.addLabel({
                pos: [xMax - 1, 0, 0],
                text: xLabel,
                style: labelStyle
            });

            yLabelID = threeCBs.addLabel({ pos: [0, yMax, 0], text: yLabel, style: labelStyle });

            threeCBs.drawLabels();
            threeCBs.render();
        }

        return () => {
            if (xLabelID) {
                threeCBs.removeLabel(xLabelID);
                xLabelID = null;
            }

            if (yLabelID) {
                threeCBs.removeLabel(yLabelID);
                yLabelID = null;
            }

            threeCBs.drawLabels();
        };
    }, [threeCBs, showLabels, xMax, yMax, labelStyle]);

    return null;
}

function RawTickGeometry(tickRadius) {
    const domeRadius = tickRadius;
    const domeWidthSubdivisions = 12;
    const domeHeightSubdivisions = 12;
    const domePhiStart = 0;
    const domePhiEnd = Math.PI * 2;
    const domeThetaStart = 0;
    const domeThetaEnd = Math.PI;

    return new THREE.SphereBufferGeometry(
        domeRadius,
        domeWidthSubdivisions,
        domeHeightSubdivisions,
        domePhiStart,
        domePhiEnd,
        domeThetaStart,
        domeThetaEnd
    );
}
