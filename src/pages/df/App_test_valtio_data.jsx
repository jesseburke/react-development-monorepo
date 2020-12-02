import { atom, useAtom } from 'jotai';

import { proxy, subscribe, snapshot } from 'valtio';

import MainDataComp from '../../data/MainDataComp.jsx';
import PointData from '../../data/PointData.jsx';
import EquationData from '../../data/EquationData.jsx';

import MainDataCompV from '../../data/MainDataComp-valtio.jsx';
import PointDataV from '../../data/PointData-valtio.jsx';
import EquationDataV from '../../data/EquationData-valtio.jsx';

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

export const arrowGridDataAtom = atom(initArrowData);

const initBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

export const boundsAtom = atom(initBounds);

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 0.1
};

export const solutionCurveDataAtom = atom(initSolutionCurveData);

export const defaultLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

const defaultTickLabelStyle = Object.assign(Object.assign({}, defaultLabelStyle), {
    fontSize: '1em',
    color: '#e19662'
});

const initAxesData = {
    radius: 0.01,
    color: '#0A2C3C',
    show: true,
    showLabels: true,
    labelStyle: defaultLabelStyle,
    tickRadiusMultiple: 10,
    tickLabelDistance: 2,
    tickLabelStyle: defaultTickLabelStyle
};

export const axesDataAtom = atom(initAxesData);

export const labelAtom = atom({ xLabel: 'x', yLabel: 'y', twoD: 1 });

const initInitialPoint = { x: 2, y: 2 };

const initFuncStr = 'x*y*sin(x+y)/10';

//------------------------------------------------------------------------
//
// primitive atoms

const primObj = {
    ip: PointData(initInitialPoint, 'Initial Point: ')
};

const derObj = {
    fs: EquationData({ initVal: initFuncStr, equationLabelString: 'need to fill this in' })
};

// next step...rewrite copy of MainDataComp to accept testObj instead
// of atomStore...then rewrite reset.

const atomStore = { ...primObj, ...derObj };

export const DataComp = MainDataComp(atomStore);

export const { atom: funcStrAtom, component: EquationInput } = atomStore.fs;

export const { atom: initialPointAtom, component: InitialPointInput } = atomStore.ip;

const atomStoreV = {
    ip: PointDataV(initInitialPoint, 'Initial Point: '),
    fs: EquationDataV({
        initVal: { str: initFuncStr },
        equationLabelString: 'need to fill this in'
    })
};

export const { proxy: initialPointProxy, component: InitialPointInputV } = atomStoreV.ip;
export const { proxy: equationProxy, component: EquationInputV } = atomStoreV.fs;

export const DataCompV = MainDataCompV(atomStoreV);

//------------------------------------------------------------------------
//
// derived data

export const funcAtom = atom((get) => ({
    func: funcParser(get(funcStrAtom))
}));

export const funcProxy = proxy({ func: funcParser(initFuncStr) });

subscribe(equationProxy, () => {
    console.log('equationProxy changed and funcProxy subscription called');
    funcProxy.func = funcParser(snapshot(equationProxy).str);
});
