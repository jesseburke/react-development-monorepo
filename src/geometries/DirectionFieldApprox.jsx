import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { RK4Pts } from '../math/RK4.jsx';

// function func is a function of x and y

export default function DirectionFieldApproxGeom({
    func,
    initialPt = [1, 3],
    bounds = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    h = 0.01,
    radius = 0.05,
    tubularSegments = 1064,
    radialSegments = 8
}) {
    const { xMin, xMax, yMin, yMax } = bounds;

    if (initialPt[0] > xMax || initialPt[0] < xMin) {
        console.log(
            'DirectionFieldApproxGeom was called with an initial point outside of the bounds given'
        );
        return;
    }

    let pointArray = RK4Pts({ func, initialPt, bounds, h });

    pointArray = pointArray.map(([x, y]) => new THREE.Vector3(x, y, 0));

    const path = new THREE.CurvePath();

    for (let i = 0; i < pointArray.length - 1; i++) {
        path.add(new THREE.LineCurve3(pointArray[i], pointArray[i + 1]));
    }

    if (path.curves.length === 0) {
        return null;
    }

    return new THREE.TubeBufferGeometry(path, tubularSegments, radius, radialSegments, false);
}
