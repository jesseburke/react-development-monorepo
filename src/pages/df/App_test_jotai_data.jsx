import { atom, useAtom } from 'jotai';

import MainDataComp from '../../data/MainDataComp.jsx';
import PointData from '../../data/PointData.jsx';
import EquationData from '../../data/EquationData.jsx';

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

const initAxesData = {
  radius: 0.01,
  show: true,
  tickLabelDistance: 5
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

const equationLabelAtom = atom(
  (get) => 'd' + get(labelAtom).x + '/d' + get(labelAtom.atom).y + ' =  '
);

const derObj = {
  fs: EquationData({ initVal: initFuncStr, equationLabelAtom })
};

// next step...rewrite copy of MainDataComp to accept testObj instead
// of atomStore...then rewrite reset.

const atomStore = { ...primObj, ...derObj };

export const DataComp = MainDataComp(atomStore);

export const { atom: funcStrAtom, component: EquationInput } = atomStore.fs;

export const { atom: initialPointAtom, component: InitialPointInput } = atomStore.ip;

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => ({
  func: funcParser(get(funcStrAtom))
}));
