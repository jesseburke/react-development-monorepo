import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';
import { useAtomCallback, useUpdateAtom, atomWithReset } from 'jotai/utils';
import styles from '../base_styles.module.css';

import MainDataComp from '../../../data/MainDataComp.jsx';
import LabelData from '../../../data/LabelData.jsx';
import PointData from '../../../data/PointData.jsx';
import EquationData from '../../../data/EquationData.jsx';
import ArrowGridData from '../../../data/ArrowGridData.jsx';
import AxesData from '../../../data/Axes2DData.jsx';
import BoundsData from '../../../data/BoundsData';
import CurveData from '../../../data/CurveData';

import funcParser from '../../../utils/funcParser.jsx';

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

const initInitialPoint = { x: 2, y: 2 };

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 0.1
};

const initXFuncStr = 'sin(x)';
const initYFuncStr = 'cos(y)';

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

export const labelAtom = LabelData({ twoD: true });
export const initialPointAtom = PointData(initInitialPoint, 'Initial Point: ');
export const arrowGridDataAtom = ArrowGridData(initArrowData);
export const axesDataAtom = AxesData({
    ...initAxesData,
    tickLabelStyle
});
export const solutionCurveDataAtom = CurveData(initSolutionCurveData);

export const boundsAtom = BoundsData({
    initBounds,
    labelAtom
});

export const orthoCameraDataAtom = OrthoCameraData(initCameraData);

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

const derObj = {
    xs: EquationData({
        initVal: initXFuncStr,
        equationLabelAtom: atom((get) => 'g(' + get(primObj.ls.atom).x + ') = '),
        inputSize: 10
    }),
    ys: EquationData({
        initVal: initYFuncStr,
        equationLabelAtom: atom((get) => 'h(' + get(primObj.ls.atom).y + ') = '),
        inputSize: 10
    })
};

const atomStore = { ...primObj, ...derObj };

export const DataComp = MainDataComp(atomStore);

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => ({
    func: funcParser('(' + get(atomStore.xs.atom) + ')*(' + get(atomStore.ys.atom) + ')')
}));

//------------------------------------------------------------------------
//
// input components

export const SepEquationInput = React.memo(function SepEquationI({}) {
    const { x: xLabel, y: yLabel } = useAtom(atomStore.ls.atom)[0];

    return (
        <div className='flex flex-col justify-center items-center h-full'>
            <div className='px-2'>
                d{yLabel}/d{xLabel} = <span>g({xLabel})</span>
                <span>{'\u{00B7}'}</span>
                <span>h({yLabel})</span>
            </div>
            <div className='flex flex-col md:flex-row'>
                <span className='px-2 py-1'>
                    <XEquationInput />
                </span>
                <span className='px-2 py-1'>
                    <YEquationInput />
                </span>
            </div>
        </div>
    );
});
