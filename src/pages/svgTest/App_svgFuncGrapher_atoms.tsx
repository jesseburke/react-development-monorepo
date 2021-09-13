import { atom } from 'jotai';

import { FunctionDataComp } from '@jesseburke/data';
import { AxesDataComp } from '@jesseburke/data';
import { CurveDataComp } from '@jesseburke/data';
import { SvgDataComp } from '@jesseburke/data';

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
