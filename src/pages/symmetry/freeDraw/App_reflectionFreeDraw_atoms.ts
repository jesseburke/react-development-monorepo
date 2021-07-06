import * as THREE from 'three';

import { atom } from 'jotai';

import LineFactory from '../../../factories/LineFactory.jsx';

import MainDataComp from '../../../data/MainDataComp.jsx';
import LabelDataComp from '../../../data/LabelDataComp.jsx';
import FunctionDataComp from '../../../data/FunctionDataComp.jsx';
import AxesDataComp from '../../../data/AxesDataComp.jsx';
import BoundsDataComp from '../../../data/BoundsDataComp';
import AnimationData from '../../../data/AnimationData';
import PerspCameraData from '../../../data/PerspCameraDataComp';
import OrthoCameraDataComp from '../../../data/OrthoCameraDataComp';

//------------------------------------------------------------------------
//
// initial constants

export const halfXSize = 20;
export const halfYSize = 14;
export const gridSize = 100;

const initOrthographicData = {
    position: [0, 0, 10],
    up: [0, 0, 1],
    //fov: 75,
    near: -1,
    far: 50,
    orthographic: { left: -halfXSize, right: halfXSize, top: halfYSize, bottom: -halfYSize }
};

const initBounds = { xMin: -20, xMax: 20, yMin: -14, yMax: 14 };

const initCameraData = {
    center: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
};

const initAxesData = {
    radius: 0.02,
    show: true,
    tickLabelDistance: 5
};

const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

const colors = {
    tick: '#cf6c28' //#e19662'
};

const tickLabelStyle = Object.assign(Object.assign({}, labelStyle), {
    fontSize: '1.5em',
    color: colors.tick
});

//------------------------------------------------------------------------
//
// atoms

export const boundsData = BoundsDataComp({
    initBounds
});

export const cameraData = OrthoCameraDataComp(initCameraData);

export const axesData = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});

export const drawingAtom = atom(true);

export const linePointAtom = atom(null);

export const lineDataAtom = atom((get) => {
    const pt = get(linePointAtom);

    if (!pt) return null;

    return LineFactory(pt);
});

const atomStoreAtom = atom({
    bd: boundsData.readWriteAtom,
    cd: cameraData.readWriteAtom,
    ad: axesData.readWriteAtom
});

//export const DataComp = MainDataComp(atomStoreAtom);
