import { atom } from 'jotai';

import MainDataComp from '../../data/MainDataComp.jsx';
import LabelData from '../../data/LabelData.jsx';
import PointData from '../../data/PointData.jsx';
import FunctionData from '../../data/FunctionData.jsx';
import AxesData from '../../data/AxesData.jsx';
import BoundsData from '../../data/BoundsData';
import AnimationData from '../../data/AnimationData';
import OrthoCameraData from '../../data/OrthoCameraData';

import { ObjectPoint2, Bounds, CurveData2, LabelStyle, AxesDataT } from '../../my-types';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#cf6c28' //#e19662'
};

const initBounds: Bounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

const initFuncStr: string = '4*e^(-(x-2*t)^2)+sin(x+t)-cos(x-t)';

const initAxesData: AxesDataT = {
    radius: 0.02,
    show: true,
    tickLabelDistance: 5
};

const initCameraData = {
    center: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
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
// primitive atoms

export const labelAtom = LabelData({ xLabel: 't', yLabel: 'x', twoD: true });
export const axesDataAtom = AxesData({
    ...initAxesData,
    tickLabelStyle
});

const functionLabelAtom = atom((get) => 's(' + get(labelAtom).x + ', ' + get(labelAtom).y + ') = ');

export const funcAtom = FunctionData({
    initVal: initFuncStr,
    functionLabelAtom,
    xVar: 't',
    yVar: 'x'
});
export const boundsAtom = BoundsData({
    initBounds,
    labelAtom
});

export const orthoCameraDataAtom = OrthoCameraData(initCameraData);

export const animationDataAtom = AnimationData({ min: 0, max: initBounds.xMax });

const atomStoreAtom = atom({
    ls: labelAtom,
    ax: axesDataAtom,
    fn: funcAtom.functionStrAtom,
    bd: boundsAtom,
    cd: orthoCameraDataAtom,
    ad: animationDataAtom
});

export const DataComp = MainDataComp(atomStoreAtom);
