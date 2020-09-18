import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import classnames from 'classnames';
import styles from './base_styles.module.css';

import Input from '../../components/Input.jsx';

import ArrowGridData from '../../data/ArrowGridData.jsx';
import BoundsData from '../../data/BoundsData.jsx';
import CurveData from '../../data/CurveData.jsx';

import funcParser from '../../utils/funcParser.jsx';
import { round } from '../../utils/BaseUtils.jsx';
//------------------------------------------------------------------------
//
// initial constants

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

//------------------------------------------------------------------------
//
// primitive atoms

export const xLabelAtom = atom(initXLabel);

export const yLabelAtom = atom(initYLabel);

export const initialPointAtom = atom(initialInitialPoint);

export const xFuncStrAtom = atom(initXFuncStr);
export const yFuncStrAtom = atom(initYFuncStr);

export const {
    atom: arrowGridOptionsAtom,
    component: ArrowGridOptionsInput,
    encode: arrowGridOptionsEncode,
    decode: arrowGridOptionsDecode,
    length: agoel // agoel = arrow grid options encode length
} = ArrowGridData(initArrowData);

export const {
    atom: boundsAtom,
    component: BoundsInput,
    encode: boundsEncode,
    decode: boundsDecode,
    length: bel
} = BoundsData({
    initBounds,
    xLabelAtom,
    yLabelAtom
});

export const {
    atom: solutionCurveOptionsAtom,
    component: SolutionCurveOptionsInput,
    encode: solutionCurveOptionsEncode,
    decode: solutionCurveOptionsDecode,
    length: scoel
} = CurveData(initSolutionCurveData);

//------------------------------------------------------------------------
//
// encode and decode functions for primitive atoms
//

// everything depends on order of following:

export const atomArray = [
    arrowGridOptionsAtom,
    boundsAtom,
    solutionCurveOptionsAtom,
    xLabelAtom,
    yLabelAtom,
    initialPointAtom,
    xFuncStrAtom,
    yFuncStrAtom
];

// should be pure function

export const encode = ([
    arrowGridOptions,
    bounds,
    solutionCurveOptions,
    xLabel,
    yLabel,
    initialPoint,
    xFuncStr,
    yFuncStr
]) => {
    const agoe = arrowGridOptionsEncode(arrowGridOptions);

    const be = boundsEncode(bounds);

    const scoe = solutionCurveOptionsEncode(solutionCurveOptions);

    return [
        ...agoe,
        ...be,
        ...scoe,
        xLabel,
        yLabel,
        initialPoint.x,
        initialPoint.y,
        xFuncStr,
        yFuncStr
    ];
};

// this function expects an array in the form returned by encode,
// returns an array that can be cycled through and used to set the
// value of each atom (this has to be done in react)
export function decode(valueArray) {
    // aga = arrow grid array
    const aga = valueArray.slice(0, agoel);
    const ba = valueArray.slice(agoel, agoel + bel);
    const scoa = valueArray.slice(agoel + bel, agoel + bel + scoel);

    const n = agoel + bel + scoel;

    return [
        arrowGridOptionsDecode(aga),
        boundsDecode(ba),
        solutionCurveOptionsDecode(scoa),
        valueArray[n],
        valueArray[n + 1],
        { x: Number(valueArray[n + 2]), y: Number(valueArray[n + 3]) },
        valueArray[n + 4],
        valueArray[n + 5]
    ];
}

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
    const [xFuncStr, setXFuncStr] = useAtom(xFuncStrAtom);
    const [yFuncStr, setYFuncStr] = useAtom(yFuncStrAtom);
    const [xLabel] = useAtom(xLabelAtom);
    const [yLabel] = useAtom(yLabelAtom);

    const cssRef = useRef({ padding: '.05em' }, []);
    const cssRef2 = useRef({ paddingRight: '.5em' }, []);
    const cssRef3 = useRef({ padding: '1em 0em' }, []);

    const xFuncInputCB = useCallback((str) => setXFuncStr(str), [setXFuncStr]);
    const yFuncInputCB = useCallback((str) => setYFuncStr(str), [setYFuncStr]);

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
                d{yLabel}/d{xLabel} =<span style={cssRef.current}>h({yLabel})</span>
                <span style={cssRef.current}>{'\u{00B7}'}</span>
                <span style={cssRef.current}>q({xLabel})</span>
            </div>
            <div style={cssRef.current}>
                <span style={cssRef2.current}>
                    <span style={cssRef2.current}>h({yLabel}) = </span>
                    <Input size={10} initValue={yFuncStr} onC={yFuncInputCB} />
                </span>
                <span>
                    <span css={cssRef2.current}>g({xLabel}) = </span>
                    <Input size={10} initValue={xFuncStr} onC={xFuncInputCB} />
                </span>
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
