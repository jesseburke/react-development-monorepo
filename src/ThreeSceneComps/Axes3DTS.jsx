import React, { useEffect } from 'react';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export default React.memo(function Axes3DTS({
    threeCBs,
    bounds,
    radius = 0.05,
    color,
    show,
    showLabels,
    xLabel = 'x',
    yLabel = 'y',
    zLabel = 'z',
    labelStyle,
    tickRadius = 2.5
}) {
    useEffect(() => {
        if (!threeCBs) return;

        const { xMin, xMax, yMin, yMax, zMin, zMax } = bounds;

        // this will hold axes and all adornments
        const axesGroup = new THREE.Group();

        let tickGeomArray = [];

        if (show) {
            // make two axes first
            const material = new THREE.LineBasicMaterial({
                color: color,
                linewidth: 100
            });

            const radiusTop = radius;
            const radiusBottom = radius;
            let height;

            let radialSegments = 8;
            let heightSegments = 40;
            let openEnded = true;

            height = xMax - xMin;
            const xa = new THREE.CylinderBufferGeometry(
                radiusTop,
                radiusBottom,
                height,
                radialSegments,
                heightSegments,
                openEnded
            );
            xa.rotateZ(Math.PI / 2);
            xa.translate((xMax + xMin) / 2, 0, 0);

            for (let i = 0; i < height; i++) {
                tickGeomArray.push(RawTickGeometry(radius * tickRadius).translate(xMin + i, 0, 0));
            }

            height = yMax - yMin;
            const ya = new THREE.CylinderBufferGeometry(
                radiusTop,
                radiusBottom,
                height,
                radialSegments,
                heightSegments,
                openEnded
            );
            ya.translate(0, (yMax + yMin) / 2, 0);

            for (let i = 0; i < height; i++) {
                tickGeomArray.push(RawTickGeometry(radius * tickRadius).translate(0, yMin + i, 0));
            }

            height = zMax - zMin;
            const za = new THREE.CylinderBufferGeometry(
                radiusTop,
                radiusBottom,
                height,
                radialSegments,
                heightSegments,
                openEnded
            );
            za.translate(0, 0, (zMax + zMin) / 2);
            za.rotateX(Math.PI / 2);

            for (let i = 0; i < height; i++) {
                tickGeomArray.push(RawTickGeometry(radius * tickRadius).translate(0, 0, zMin + i));
            }

            const axesMaterial = new THREE.MeshBasicMaterial({ color: color });
            axesGroup.add(new THREE.Mesh(xa, axesMaterial));
            axesGroup.add(new THREE.Mesh(ya, axesMaterial));
            axesGroup.add(new THREE.Mesh(za, axesMaterial));

            // am not using tickColor for now
            const tickGeom = BufferGeometryUtils.mergeBufferGeometries(tickGeomArray);
            const tickMaterial = new THREE.MeshBasicMaterial({ color: color });
            axesGroup.add(new THREE.Mesh(tickGeom, tickMaterial));

            threeCBs.add(axesGroup);
        }

        return () => {
            if (axesGroup) {
                threeCBs.remove(axesGroup);
            }
        };
    }, [threeCBs, show, radius, bounds, radius, tickRadius, color]);

    useEffect(() => {
        if (!threeCBs || !show || !showLabels) return;

        const { xMin, xMax, yMin, yMax, zMin, zMax } = bounds;

        let xLabelID;
        let yLabelID;
        let zLabelID;

        xLabelID = threeCBs.addLabel({
            pos: [xMax, 0, 0],
            text: xLabel,
            anchor: 'lr',
            style: labelStyle
        });

        yLabelID = threeCBs.addLabel({
            pos: [0, yMax, 0],
            text: yLabel,
            anchor: 'lr',
            style: labelStyle
        });

        zLabelID = threeCBs.addLabel({
            pos: [0, 0, zMax],
            text: zLabel,
            anchor: 'lr',
            style: labelStyle
        });

        threeCBs.drawLabels();
        threeCBs.render();

        return () => {
            if (xLabelID) {
                threeCBs.removeLabel(xLabelID);
                xLabelID = null;
            }

            if (yLabelID) {
                threeCBs.removeLabel(yLabelID);
                yLabelID = null;
            }

            if (zLabelID) {
                threeCBs.removeLabel(zLabelID);
                zLabelID = null;
            }

            threeCBs.drawLabels();
        };
    }, [threeCBs, show, showLabels, bounds, labelStyle]);

    return null;
});

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
