import { atom } from 'jotai';

import MainDataComp from '../../../data/MainDataComp.jsx';
import LabelDataComp from '../../../data/LabelDataComp.jsx';
import PointDataComp from '../../../data/PointDataComp.jsx';
import FunctionDataComp from '../../../data/FunctionDataComp.jsx';
import ArrowGridDataComp from '../../../data/ArrowGridDataComp.jsx';
import AxesDataComp from '../../../data/AxesDataComp.jsx';
import BoundsDataComp from '../../../data/BoundsDataComp';
import CurveDataComp from '../../../data/CurveDataComp';
import OrthoCameraDataComp from '../../../data/OrthoCameraDataComp';

import { ObjectPoint2, Bounds, CurveData2, LabelStyle, AxesDataT } from '../../../my-types';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#cf6c28' //#e19662'
};

const initArrowData = { density: 1, thickness: 1, length: 0.75, color: colors.arrows };

const initBounds: Bounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

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

export const labelData = LabelDataComp({ twoD: true });
export const initialPointData = PointDataComp(initInitialPoint, 'Initial Point: ');
export const arrowGridData = ArrowGridDataComp(initArrowData);
export const axesData = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});
export const solutionCurveData = CurveDataComp(initSolutionCurveData);

const functionLabelAtom = atom(
    (get) => 'd' + get(labelData.atom).y + '/d' + get(labelData.atom).x + ' = '
);

export const diffEqData = FunctionDataComp({
    initVal: initFuncStr,
    functionLabelAtom,
    labelAtom: labelData.atom
});
export const boundsData = BoundsDataComp({
    initBounds,
    labelAtom: labelData.atom,
    twoD: true
});
export const orthoCameraData = OrthoCameraDataComp(initCameraData);

const atomStoreAtom = atom({
    ls: labelData,
    ip: initialPointData,
    ag: arrowGridData,
    ax: axesData,
    sc: solutionCurveData,
    fn: diffEqData,
    bd: boundsData,
    cd: orthoCameraData
});

function theta(a) {
    return Math.asin(a / Math.sqrt(a * a + 1));
}

export const zHeightAtom = atom((get) => {
    const f = get(diffEqData.funcAtom).func;

    return { func: (x, y) => 3 * theta(f(x, y)) };
});

export const DataComp = MainDataComp(atomStoreAtom);
