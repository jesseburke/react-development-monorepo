import { atom, useAtom } from 'jotai';
import { useAtomCallback, useUpdateAtom, atomWithReset } from 'jotai/utils';

import MainDataComp from '../../data/MainDataComp.jsx';
import LabelData from '../../data/LabelData.jsx';
import PointData from '../../data/PointData.jsx';
import EquationData from '../../data/EquationData.jsx';
import ArrowGridData from '../../data/ArrowGridData.jsx';
import AxesData from '../../data/Axes2DData.jsx';
import BoundsData from '../../data/BoundsData.jsx';
import CurveData from '../../data/CurveData.jsx';

import funcParser from '../../utils/funcParser.jsx';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initArrowData = { density: 1, thickness: 1, length: 0.75, color: colors.arrows };

const initBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

const initXLabel = 'x';

const initYLabel = 'y';

const initInitialPoint = { x: 2, y: 2 };

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 0.1
};

const initFuncStr = 'x*y*sin(x+y)/10';

const initAxesData = {
    radius: 0.01,
    show: true,
    tickLabelDistance: 5
};

export const labelStyle = {
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

const primObj = {
    ls: LabelData({ twoD: true }),
    ip: PointData(initInitialPoint, 'Initial Point: '),
    ag: ArrowGridData(initArrowData),
    ax: AxesData({
        ...initAxesData,
        tickLabelStyle
    }),
    sc: CurveData(initSolutionCurveData)
};

const equationLabelAtom = atom(
    (get) => 'd' + get(primObj.ls.atom).x + '/d' + get(primObj.ls.atom).y + ' =  '
);

const derObj = {
    fs: EquationData({ initVal: initFuncStr, equationLabelAtom }),
    bd: BoundsData({
        initBounds,
        labelAtom: primObj.ls.atom
    })
};

// next step...rewrite copy of MainDataComp to accept testObj instead
// of atomStore...then rewrite reset.

const atomStore = { ...primObj, ...derObj };

export const DataComp = MainDataComp(atomStore);

export const { atom: labelAtom, component: LabelInput } = atomStore.ls;

export const { atom: funcStrAtom, component: EquationInput } = atomStore.fs;

export const { atom: initialPointAtom, component: InitialPointInput } = atomStore.ip;

export const { atom: arrowGridDataAtom, component: ArrowGridDataInput } = atomStore.ag;

export const { atom: axesDataAtom, component: AxesDataInput } = atomStore.ax;

export const { atom: boundsAtom, component: BoundsInput } = atomStore.bd;

export const { atom: solutionCurveDataAtom, component: SolutionCurveDataInput } = atomStore.sc;

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => ({
    func: funcParser(get(atomStore.fs.atom))
}));
