import { atom } from 'jotai';

import FunctionDataComp from '../../data/FunctionDataComp.jsx';
import AxesDataComp from '../../data/AxesDataComp.jsx';
import CurveDataComp from '../../data/CurveDataComp';
import SvgDataComp from '../../SVGComps/SvgDataComp';

//------------------------------------------------------------------------
//
// initial constants

const initFuncStr = 'sin(1/x)';

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

export const funcData = FunctionDataComp({
    initVal: initFuncStr,
    functionLabelAtom: atom('f(x) = ')
});

export const curveData = CurveDataComp(initSolutionCurveData);

export const svgData = SvgDataComp();

export const atomStoreAtom = atom({
    fn: funcData.readWriteAtom,
    cd: curveData.readWriteAtom,
    svg: svgData.svgSaveDataAtom
});

//export const DataComp = MainDataComp(atomStoreAtom);
