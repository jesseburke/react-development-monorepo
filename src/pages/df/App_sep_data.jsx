import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';
import { useAtomCallback, useUpdateAtom, atomWithReset } from 'jotai/utils';
import classnames from 'classnames';
import styles from './base_styles.module.css';

import MainDataComp from '../../data/MainDataComp.jsx';
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

const initArrowData = { density: 1, thickness: 1, length: 0.75, color: '#C2374F' };

const initBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

const initXLabel = 'x';

const initYLabel = 'y';

const initialInitialPoint = { x: 2, y: 2 };

const initSolutionCurveData = {
    color: '#C2374F',
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

export const xLabelAtom = atomWithReset(initXLabel);

const xLabelDecode = (str) => {
    if (!str || !str.length || str.length === 0) return initXLabel;

    return str;
};

export const yLabelAtom = atomWithReset(initYLabel);

const yLabelDecode = (str) => {
    if (!str || !str.length || str.length === 0) return initYLabel;

    return str;
};

export const {
    atom: initialPointAtom,
    component: InitialPointInput,
    encode: initialPointEncode,
    decode: initialPointDecode
} = PointData(initialInitialPoint, 'Initial Point: ');

export const {
    atom: xFuncStrAtom,
    component: XEquationInput,
    encode: xFuncStrEncode,
    decode: xFuncStrDecode
} = EquationData({
    initVal: initXFuncStr,
    equationLabelAtom: atom((get) => 'g(' + get(xLabelAtom) + ') = '),
    inputSize: 10
});

export const {
    atom: yFuncStrAtom,
    component: YEquationInput,
    encode: yFuncStrEncode,
    decode: yFuncStrDecode
} = EquationData({
    initVal: initYFuncStr,
    equationLabelAtom: atom((get) => 'h(' + get(yLabelAtom) + ') = '),
    inputSize: 10
});

export const {
    atom: arrowGridDataAtom,
    component: ArrowGridDataInput,
    encode: arrowGridDataEncode,
    decode: arrowGridDataDecode
} = ArrowGridData(initArrowData);

export const {
    atom: axesDataAtom,
    component: AxesDataInput,
    encode: axesDataEncode,
    decode: axesDataDecode
} = AxesData({
    ...initAxesData,
    tickLabelStyle
});

export const {
    atom: boundsAtom,
    component: BoundsInput,
    encode: boundsDataEncode,
    decode: boundsDataDecode
} = BoundsData({
    initBounds,
    xLabelAtom,
    yLabelAtom
});

export const {
    atom: solutionCurveDataAtom,
    component: SolutionCurveDataInput,
    encode: curveDataEncode,
    decode: curveDataDecode
} = CurveData(initSolutionCurveData);

//------------------------------------------------------------------------
// the first entry in each array is the atom; the second is a function to
// turn the atom value into a string; third entry is a function that takes a
// string and returns an object, should be inverse to the second
// argument.

const atomStore = {
    xl: [xLabelAtom, (x) => (x ? x.toString() : null), xLabelDecode],
    yl: [yLabelAtom, (x) => (x ? x.toString() : null), yLabelDecode],
    ip: [initialPointAtom, initialPointEncode, initialPointDecode],
    xs: [xFuncStrAtom, xFuncStrEncode, xFuncStrDecode],
    ys: [yFuncStrAtom, yFuncStrEncode, yFuncStrDecode],
    ag: [arrowGridDataAtom, arrowGridDataEncode, arrowGridDataDecode],
    ax: [axesDataAtom, axesDataEncode, axesDataDecode],
    bd: [boundsAtom, boundsDataEncode, boundsDataDecode],
    sc: [solutionCurveDataAtom, curveDataEncode, curveDataDecode]
};

export const DataComp = MainDataComp(atomStore);

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => ({
    func: funcParser('(' + get(xFuncStrAtom) + ')*(' + get(yFuncStrAtom) + ')')
}));

//------------------------------------------------------------------------
//
// input components

export const SepEquationInput = React.memo(function SepEquationI({}) {
    const [xLabel] = useAtom(xLabelAtom);
    const [yLabel] = useAtom(yLabelAtom);

    return (
        <div className={styles['center-flex-column']}>
            <div className={styles['very-small-padding']}>
                d{yLabel}/d{xLabel} = <span>g({xLabel})</span>
                <span>{'\u{00B7}'}</span>
                <span>h({yLabel})</span>
            </div>
            <div>
                <span className={styles['very-small-padding']}>
                    <XEquationInput />
                </span>
                <span className={styles['very-small-padding']}>
                    <YEquationInput />
                </span>
            </div>
        </div>
    );
});
