import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import { Input } from '@jesseburke/components';

import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { BoundsDataComp } from '@jesseburke/jotai-data-setup';
import { OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';
import { PointDataComp } from '@jesseburke/jotai-data-setup';

//------------------------------------------------------------------------
//
// initial constants

export const halfXSize = 20;
export const halfYSize = 14;
export const gridSize = 100;

const initBounds = { xMin: -30, xMax: 30, yMin: -14, yMax: 14 };

const initCameraData = {
    center: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
};

const initAxesData = {
    radius: 0.02,
    show: true,
    showLabels: false,
    tickLabelDistance: 0
};

const initRotatePoint = { x: 2.5, y: 0 };

const startingAngle = 30;

const degToRad = (deg) => deg * 0.0174533;

const radToDeg = (rad) => rad * 57.2958;

function normalizeAngleDeg(angle) {
    const newAngle = angle % 360;

    if (newAngle > 180) {
        return newAngle - 360;
    } else if (newAngle < -180) {
        return newAngle + 360;
    }

    return newAngle;
}

function round(x, n = 3) {
    // x = -2.336596841557143

    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}

//------------------------------------------------------------------------
//
// atoms

export const boundsData = BoundsDataComp({
    initBounds
});

export const cameraData = OrthoCameraDataComp(initCameraData);

export const axesData = AxesDataComp({
    ...initAxesData
});

export const rotatePointData = PointDataComp(initRotatePoint);

export const drawingAtom = atom(true);

export const curAngleAtom = atom(degToRad(startingAngle));

export const totalRotationAtom = atom(0.0);

export function CurAngleComp({ classNameStr = '' }) {
    const [curAngle, setCurAngle] = useAtom(curAngleAtom);

    const curAngleCB = useCallback((value) => {
        setCurAngle(degToRad(normalizeAngleDeg(eval(value))));
    }, []);

    return (
        <span className={classNameStr}>
            <Input size={4} initValue={round(radToDeg(curAngle), 2)} onC={curAngleCB} />
            {`\u{00B0}`}
        </span>
    );
}

export function TotalRotationComp({ classNameStr = '' }) {
    const [tr, setTR] = useAtom(totalRotationAtom);

    const TRCB = useCallback((value) => {
        setTR(degToRad(normalizeAngleDeg(eval(value))));
    }, []);

    return (
        <span className={classNameStr}>
            <Input size={4} initValue={round(radToDeg(tr), 2)} onC={TRCB} />
            {`\u{00B0}`}
        </span>
    );
}
