import React from 'react';
import { atom } from 'jotai';

import { FunctionDataComp } from '@jesseburke/jotai-data-setup';
import { CurveDataComp } from '@jesseburke/jotai-data-setup';
import SvgDataComp from './SvgData';

//------------------------------------------------------------------------
//
// initial constants

const initSolutionCurveData = {
    color: '#B01A46',
    approxH: 0.01,
    visible: true,
    width: 4
};

const initXFuncStr = 'cos(t) + (1/2)*cos(6*t) + (1/3)*sin(14*t)';
const initYFuncStr = 'sin(t) + (1/2)*sin(6*t) + (1/3)*cos(14*t)';

//------------------------------------------------------------------------
//
// primitive atoms

export const xFuncData = FunctionDataComp({
    initVal: initXFuncStr,
    functionLabelAtom: atom('x(t) = '),
    labelAtom: atom({ x: 't' }),
    inputSize: 40
});

export const yFuncData = FunctionDataComp({
    initVal: initYFuncStr,
    functionLabelAtom: atom('y(t) = '),
    labelAtom: atom({ x: 't' }),
    inputSize: 40
});

export const curveData = CurveDataComp(initSolutionCurveData);

export const svgData = SvgDataComp();

export const atomStoreAtom = atom({
    x: xFuncData.readWriteAtom,
    y: yFuncData.readWriteAtom,
    cd: curveData.readWriteAtom,
    svg: svgData.svgSaveDataAtom
});

//------------------------------------------------------------------------
//
// input component

export const ParamEqInput = () => {
    return (
        <div className='flex flex-col md:flex-row'>
            <span className='px-2 py-1'>
                <xFuncData.component />
            </span>
            <span className='px-2 py-1'>
                <yFuncData.component />
            </span>
        </div>
    );
};
