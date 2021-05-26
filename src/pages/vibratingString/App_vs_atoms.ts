import { atom } from 'jotai';

import MainDataComp from '../../data/MainDataComp.jsx';
import LabelDataComp from '../../data/LabelDataComp.jsx';
import PointDataComp from '../../data/PointDataComp.jsx';
import FunctionDataComp from '../../data/FunctionDataComp.jsx';
import AxesDataComp from '../../data/AxesDataComp.jsx';
import BoundsDataComp from '../../data/BoundsDataComp';
import AnimationData from '../../data/AnimationData';
import PerspCameraData from '../../data/PerspCameraData';
import OrthoCameraDataComp from '../../data/OrthoCameraDataComp';

import { ObjectPoint2, Bounds, CurveData2, LabelStyle, AxesDataT } from '../../my-types';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#cf6c28' //#e19662'
};

const initBounds: Bounds = { xMin: -1, xMax: 10, yMin: -10, yMax: 10, zMin: -5, zMax: 5 };

const initFuncStr: string = '4*e^(-(x-2*t)^2)+sin(x+t)-cos(x-t)';

const initAxesData: AxesDataT = {
    radius: 0.02,
    show: true,
    tickLabelDistance: 0
};

const initXLength = initBounds.xMax - initBounds.xMin;
const initYLength = initBounds.yMax - initBounds.yMin;

const initCameraData = {
    target: [initXLength * (10.15 / 20), initYLength * (4.39 / 20), 0],
    position: [(-16.7 / 20) * initXLength, (-26.1 / 20) * initYLength, 6.65]
};

export const labelStyle: LabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

const tickLabelStyle = Object.assign(Object.assign({}, labelStyle), {
    fontSize: '1.5em',
    color: colors.tick
});

//------------------------------------------------------------------------
//
// atoms

export const labelAtom = LabelDataComp({ yLabel: 't', twoD: true });
export const axesDataAtom = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});

const functionLabelAtom = atom((get) => 's(' + get(labelAtom).x + ', ' + get(labelAtom).y + ') = ');

export const funcAtom = FunctionDataComp({
    initVal: initFuncStr,
    functionLabelAtom,
    xVar: 'x',
    yVar: 't',
    inputSize: 40
});

export const boundsAtom = BoundsDataComp({
    initBounds,
    labelAtom
});

const xCanvOverhang = 0;

export const canvasBoundsAtom = atom((get) => {
    const { xMin, xMax, zMin, zMax } = get(boundsAtom);

    return {
        xMin: xMin - xCanvOverhang,
        xMax,
        yMin: zMin,
        yMax: zMax
    };
});

const gridOverhang = 2;

export const gridBoundsAtom = atom((get) => {
    const { xMin, xMax, yMin, yMax } = get(boundsAtom);

    return {
        xMin: xMin - gridOverhang,
        xMax: xMax + gridOverhang,
        yMin: yMin - gridOverhang,
        yMax: yMax + gridOverhang
    };
});

const minMaxForAnimationAtom = atom((get) => {
    return { min: get(boundsAtom).yMin, max: get(boundsAtom).yMax };
});

export const animationDataAtom = AnimationData({ minMaxAtom: minMaxForAnimationAtom });

export const animationValueAtom = atom((get) => get(animationDataAtom).t);

const planeOverhang = 0;

export const planeHeightAndWidthAtom = atom((get) => {
    const { xMin, xMax, zMin, zMax } = get(boundsAtom);

    return { width: xMax - xMin + planeOverhang, height: zMax - zMin };
});

export const planeCenterAtom = atom((get) => {
    const { xMin, xMax } = get(boundsAtom);

    return [(xMax - xMin) / 2 + xMin, get(animationValueAtom)];
});

export const twoDFuncAtom = atom((get) => {
    const t = get(animationValueAtom);

    return { func: (x) => get(funcAtom).func(x, t) };
});

export const cameraDataAtom = PerspCameraData(initCameraData);

const atomStoreAtom = atom({
    ls: labelAtom,
    ax: axesDataAtom,
    fn: funcAtom.functionStrAtom,
    bd: boundsAtom,
    cd: cameraDataAtom,
    ad: animationDataAtom
});

export const DataComp = MainDataComp(atomStoreAtom);
