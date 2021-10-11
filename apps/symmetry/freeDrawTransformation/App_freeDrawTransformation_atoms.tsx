import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import { Input } from '@jesseburke/components';

import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { BoundsDataComp } from '@jesseburke/jotai-data-setup';
import { OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';

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

const initTranslatePoint = { x: 2.0, y: 1.0 };

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

export const drawingAtom = atom(true);

const primAnimAtom = atom(false);

export const animatingAtom = atom(
    (get) => get(primAnimAtom),
    (get, set, val) => {
        //console.log('animatingAtom set called with val = ', val);
        set(primAnimAtom, val);
    }
);

// amount the shape will be translated, when 'translate' button is clicked
export const curTranslationAtom = atom(initTranslatePoint);

// the total amount of translation that has been applied; usually
// comes from button clicking, but can also be set directly
export const totalTranslationAtom = atom({ x: 0.0, y: 0.0 });

export const addCurToTotalAtom = atom(null, (get, set) => {
    const ct = get(curTranslationAtom);
    const tt = get(totalTranslationAtom);

    const newTT = { x: ct.x + tt.x, y: ct.y + tt.y };
    set(totalTranslationAtom, newTT);
});

// this is used to display an arrow that shows where a point will be
// moved by the current translation; translateStartPointAtom is passed
// to a ClickablePlaneComp, and set by that
export const translateStartPointAtom = atom(initTranslatePoint);
export const translateEndPointAtom = atom((get) => {
    const s = get(translateStartPointAtom);
    const t = get(curTranslationAtom);

    return { x: s.x + t.x, y: s.y + t.y };
});

export const resetAtom = atom(null, (get, set) => {
    set(curTranslationAtom, initTranslatePoint);
    set(totalTranslationAtom, { x: 0, y: 0 });
    set(drawingAtom, true);
});

export function CurTranslationComp({ classNameStr = '' }) {
    const [curT, setCurT] = useAtom(curTranslationAtom);

    const xCB = useCallback(
        (value) =>
            setCurT((oldVal) => ({
                ...oldVal,
                x: parseFloat(value)
            })),
        []
    );

    const yCB = useCallback(
        (value) =>
            setCurT((oldVal) => ({
                ...oldVal,
                y: parseFloat(value)
            })),
        []
    );

    return (
        <span className={classNameStr}>
            <Input size={2} initValue={curT.x} onC={xCB} /> ,
            <Input size={2} initValue={curT.y} onC={yCB} />
        </span>
    );
}

export function TotalTranslationComp({ classNameStr = '' }) {
    const [tT, setTT] = useAtom(totalTranslationAtom);

    const xCB = useCallback(
        (value) =>
            setTT((oldVal) => ({
                ...oldVal,
                x: parseFloat(value)
            })),
        []
    );

    const yCB = useCallback(
        (value) =>
            setTT((oldVal) => ({
                ...oldVal,
                y: parseFloat(value)
            })),
        []
    );

    return (
        <span className={classNameStr}>
            <Input size={2} initValue={tT.x} onC={xCB} /> ,
            <Input size={2} initValue={tT.y} onC={yCB} />
        </span>
    );
}


