import { atom } from 'jotai';

import { AxesDataComp, BoundsDataComp, OrthoCameraDataComp } from '@jesseburke/jotai-data-setup';

import { LineDataComp } from '@jesseburke/three-scene-with-react';

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

export const { pt1Atom: linePointAtom, lineDataAtom, component: LineInputComp } = LineDataComp({});
