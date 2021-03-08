import { atom } from 'jotai';

import MainDataComp from '../../../data/MainDataComp.jsx';
import LabelData from '../../../data/LabelData.jsx';
import PointData from '../../../data/PointData.jsx';
import FunctionData from '../../../data/FunctionData.jsx';
import ArrowGridData from '../../../data/ArrowGridData.jsx';
import AxesData from '../../../data/Axes2DData.jsx';
import BoundsData from '../../../data/BoundsData';
import CurveData from '../../../data/CurveData';
import OrthoCameraData from '../../../data/OrthoCameraData';

import { ObjectPoint2, Bounds2, CurveData2, LabelStyle, AxesDataT } from '../../../my-types';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#cf6c28' //#e19662'
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

export const labelAtom = LabelData({ twoD: true });
export const initialPointAtom = PointData(initInitialPoint, 'Initial Point: ');
export const arrowGridDataAtom = ArrowGridData(initArrowData);
export const axesDataAtom = AxesData({
    ...initAxesData,
    tickLabelStyle
});
export const solutionCurveDataAtom = CurveData(initSolutionCurveData);

const functionLabelAtom = atom((get) => 'd' + get(labelAtom).y + '/d' + get(labelAtom).x + ' = ');

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

export const zHeightAtom = atom((get) => {
    const f = get(diffEqAtom).func;

    function theta(a) {
        return Math.asin(a / Math.sqrt(a * a + 1));
    }

    return { func: (x, y) => 3 * theta(f(x, y)) };
});

export const DataComp = MainDataComp(atomStoreAtom);
