import { atom } from 'jotai';

import FunctionDataComp from '../../data/FunctionDataComp.jsx';
import AxesDataComp from '../../data/AxesDataComp.jsx';
import CurveDataComp from '../../data/CurveDataComp';
import SvgDataComp from '../../SVGComps/SvgDataComp';

//------------------------------------------------------------------------
//
// initial constants

const initFuncStr = 'sin(1/x)';

const initAxesData = {
    radius: 0.01,
    tickRadiusMultiple: 1,
    show: true,
    tickLabelDistance: 0
};

export const initApproxH = 0.01;

const initSolutionCurveData = {
    color: '#B01A46',
    approxH: 0.01,
    visible: true,
    width: 4
};

//------------------------------------------------------------------------
//
// primitive atoms

export const axesData = AxesDataComp({
    ...initAxesData
});

export const funcData = FunctionDataComp({
    initVal: initFuncStr,
    functionLabelAtom: atom('f(x) = ')
});

export const curveData = CurveDataComp(initSolutionCurveData);

export const svgData = SvgDataComp();

export const atomStoreAtom = atom({
    ax: axesData,
    fn: funcData,
    cd: curveData
});

export const modeAtom = atom('pan');

//export const DataComp = MainDataComp(atomStoreAtom);
