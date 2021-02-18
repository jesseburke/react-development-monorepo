import { atom } from 'jotai';

import MainDataComp from './data/MainDataComp.jsx';
import LabelData from './data/LabelData.jsx';
import PointData from './data/PointData.jsx';
import FunctionData from './data/FunctionData.jsx';
import ArrowGridData from './data/ArrowGridData.jsx';
import AxesData from './data/Axes2DData.jsx';
import BoundsData from './data/BoundsData';
import CurveData from './data/CurveData';
import OrthoCameraData from './data/OrthoCameraData';

import { ObjectPoint2, Bounds2, CurveData2, LabelStyle, AxesDataT } from './my-types';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initArrowData = { density: 1, thickness: 1, length: 0.75, color: colors.arrows };

const initBounds: Bounds2 = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

const initInitialPoint: ObjectPoint2 = { x: 2, y: 2 };

const initSolutionCurveData: CurveData2 = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 0.1
};

const initFuncStr: string = 'x*y*sin(x+y)/10';

const initAxesData: AxesDataT = {
    radius: 0.01,
    show: true,
    tickLabelDistance: 5
};

const initCameraData = {
    center: [0, 0, 0],
    viewHeight: 8,
    rotationEnabled: true
};

export const labelStyle: LabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

const tickLabelStyle = Object.assign(Object.assign({}, labelStyle), {
    fontSize: '1em',
    color: colors.tick
});

//------------------------------------------------------------------------
//
// primitive atoms

export const labelAtom = LabelData({ twoD: true });
export const initialPointAtom = PointData(initInitialPoint, 'Initial Point: ');
export const arrowGridDataAtom = ArrowGridData(initArrowData);
export const axesDataAtom = AxesData({
    ...initAxesData,
    tickLabelStyle
});
export const solutionCurveDataAtom = CurveData(initSolutionCurveData);

const functionLabelAtom = atom((get) => 'd' + get(labelAtom).x + '/d' + get(labelAtom).y + ' = ');

export const diffEqAtom = FunctionData({ initVal: initFuncStr, functionLabelAtom });
export const boundsAtom = BoundsData({
    initBounds,
    labelAtom
});

export const orthoCameraDataAtom = OrthoCameraData(initCameraData);

const atomStoreAtom = atom({
    ls: labelAtom,
    ip: initialPointAtom,
    ag: arrowGridDataAtom,
    ax: axesDataAtom,
    sc: solutionCurveDataAtom,
    fn: diffEqAtom.functionStrAtom,
    bd: boundsAtom,
    cd: orthoCameraDataAtom
});

export const DataComp = MainDataComp(atomStoreAtom);
