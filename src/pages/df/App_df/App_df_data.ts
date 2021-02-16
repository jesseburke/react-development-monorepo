import { atom, useAtom } from 'jotai';

import MainDataComp from '../../../data/MainDataComp.jsx';
import LabelData from '../../../data/LabelData.jsx';
import PointData from '../../../data/PointData.jsx';
import EquationData from '../../../data/EquationData.jsx';
import ArrowGridData from '../../../data/ArrowGridData.jsx';
import AxesData from '../../../data/Axes2DData.jsx';
import BoundsData from '../../../data/BoundsData';
import CurveData from '../../../data/CurveData';

import funcParser from '../../../utils/funcParser.jsx';
import { ObjectPoint2, Bounds2, CurveData2, LabelStyle, AxesDataT } from '../../../my-types';

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

const ls = LabelData({ twoD: true });
const ip = PointData(initInitialPoint, 'Initial Point: ');
const ag = ArrowGridData(initArrowData);
const ax = AxesData({
    ...initAxesData,
    tickLabelStyle
});
const sc = CurveData(initSolutionCurveData);

const equationLabelAtom = atom((get) => 'd' + get(ls.atom).x + '/d' + get(ls.atom).y + ' = ');

const fs = EquationData({ initVal: initFuncStr, equationLabelAtom });
const bd = BoundsData({
    initBounds,
    labelAtom: ls.atom
});

const atomStore = { ls, ip, ag, ax, sc, fs, bd };

export const DataComp = MainDataComp(atomStore);

export const { atom: labelAtom, component: LabelInput } = ls;

export const { atom: funcStrAtom, component: EquationInput } = fs;

export const { atom: initialPointAtom, component: InitialPointInput } = ip;

export const { atom: arrowGridDataAtom, component: ArrowGridDataInput } = ag;

export const { atom: axesDataAtom, component: AxesDataInput } = ax;

export const { atom: boundsAtom, component: BoundsInput } = bd;

export const { atom: solutionCurveDataAtom, component: SolutionCurveDataInput } = sc;

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => ({
    func: funcParser(get(atomStore.fs.atom))
}));
