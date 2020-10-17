import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import classnames from 'classnames';
import styles from './base_styles.module.css';

import Input from '../../components/Input.jsx';

import ArrowGridData from '../../data/ArrowGridData.jsx';
import AxesData from '../../data/Axes2DData.jsx';
import BoundsData from '../../data/BoundsData.jsx';
import CurveData from '../../data/CurveData.jsx';

import funcParser from '../../utils/funcParser.jsx';
import { round } from '../../utils/BaseUtils.jsx';
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

const initialInitialPoint = { x: 2, y: 2 };

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
    padding: '.4em',
    fontSize: '1.5em'
};

const tickLabelStyle = Object.assign(Object.assign({}, labelStyle), {
    fontSize: '1em',
    color: colors.tick
});

//------------------------------------------------------------------------
//
// primitive atoms

export const xLabelAtom = atom(initXLabel);
export const yLabelAtom = atom(initYLabel);

export const initialPointAtom = atom(initialInitialPoint);

export const funcStrAtom = atom(initFuncStr);

export const {
    atom: arrowGridDataAtom,
    component: ArrowGridDataInput,
    encode: arrowGridDataEncode,
    decode: arrowGridDataDecode,
    length: arrowGridDataLength
} = ArrowGridData(initArrowData);

export const {
    atom: axesDataAtom,
    component: AxesDataInput,
    encode: axesDataEncode,
    decode: axesDataDecode,
    length: axesDataLength
} = AxesData({
    ...initAxesData,
    tickLabelStyle
});

export const {
    atom: boundsAtom,
    component: BoundsInput,
    length: boundsDataLength,
    encode: boundsDataEncode,
    decode: boundsDataDecode
} = BoundsData({
    initBounds,
    xLabelAtom,
    yLabelAtom
});

export const {
    atom: solutionCurveOptionsAtom,
    component: SolutionCurveOptionsInput,
    length: curveDataLength,
    encode: curveDataEncode,
    decode: curveDataDecode
} = CurveData(initSolutionCurveData);

//------------------------------------------------------------------------
//
// encode and decode functions for primitive atoms
//

// everything depends on order of following:

export const atomArray = [
    arrowGridDataAtom,
    axesDataAtom,
    boundsAtom,
    solutionCurveOptionsAtom,
    xLabelAtom,
    yLabelAtom,
    initialPointAtom,
    funcStrAtom
];

// should be pure function

export function encode([
    arrowGridData,
    axesData,
    boundsData,
    solutionCurveData,
    xLabel,
    yLabel,
    initialPoint,
    funcStr
]) {
    const agd = arrowGridDataEncode(arrowGridData);

    const ad = axesDataEncode(axesData);

    const bd = boundsDataEncode(boundsData);

    const scd = curveDataEncode(solutionCurveData);

    return { agd, ad, bd, scd, xl: xLabel, yl: yLabel, ip: initialPoint, fs: funcStr };
}

// this function expects an object, in the form returned by encode,
// returns an array that can be cycled through and used to set the
// value of each atom (this has to be done in react)
export function decode(objectToDecode) {
    // aga = arrow grid array
    const agd = objectToDecode.agd;
    const ad = objectToDecode.ad;
    const bd = objectToDecode.bd;
    const scd = objectToDecode.scd;

    const l = arrowGridDataLength + axesDataLength + boundsDataLength + curveDataLength;

    return [
        arrowGridDataDecode(agd),
        axesDataDecode(ad),
        boundsDataDecode(bd),
        curveDataDecode(scd),
        objectToDecode.xl,
        objectToDecode.yl,
        objectToDecode.ip,
        objectToDecode.fs
    ];
}

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => ({
    func: funcParser(get(funcStrAtom))
}));

//------------------------------------------------------------------------
//
// input components

const eqInputSize = 20;

export const EquationInput = React.memo(function SepEquationI({}) {
    const [funcStr, setFuncStr] = useAtom(funcStrAtom);
    const [xLabel] = useAtom(xLabelAtom);
    const [yLabel] = useAtom(yLabelAtom);

    const cssRef3 = useRef({ padding: '1em 0em' }, []);

    const funcInputCB = useCallback((str) => setFuncStr(str), [setFuncStr]);

    return (
        <div
            className={classnames(
                styles['center-flex-column'],
                styles['right-border'],
                styles['large-right-padding'],
                styles['med-top-bottom-padding']
            )}
        >
            <div style={cssRef3.current}>
                d{yLabel}/d{xLabel} =
                <Input size={eqInputSize} initValue={funcStr} onC={funcInputCB} />
            </div>
        </div>
    );
});

export const InitialPointInput = React.memo(function InitialPointI({}) {
    const [initialPoint, setInitialPoint] = useAtom(initialPointAtom);

    const setX = useCallback((newX) => setInitialPoint((old) => ({ ...old, x: Number(newX) })), [
        setInitialPoint
    ]);
    const setY = useCallback((newY) => setInitialPoint((old) => ({ ...old, y: Number(newY) })), [
        setInitialPoint
    ]);

    const cssRef = useRef({ paddingRight: '5em' }, []);

    return (
        <div style={cssRef.current}>
            <span>
                <span>Initial Point: </span>
                <Input initValue={round(initialPoint.x, 3)} size={8} onC={setX} />
                <span> , </span>
                <Input initValue={round(initialPoint.y, 3)} size={8} onC={setY} />
            </span>
        </div>
    );
});
