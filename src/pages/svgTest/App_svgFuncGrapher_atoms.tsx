import { atom } from 'jotai';

import { MainDataComp } from '@jesseburke/jotai-data-setup';
import { FunctionDataComp } from '@jesseburke/jotai-data-setup';
import { AxesDataComp } from '@jesseburke/jotai-data-setup';
import { CurveDataComp } from '@jesseburke/jotai-data-setup';
import { SvgDataComp } from '@jesseburke/svg-scene-with-react';

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

export const DataComp = MainDataComp(atomStoreAtom);

//export const DataComp = MainDataComp(atomStoreAtom);
