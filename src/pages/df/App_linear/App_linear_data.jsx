import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import classnames from 'classnames';
import styles from '../base_styles.module.css';

import Input from '../../../components/Input.jsx';
import TexDisplayComp from '../../../components/TexDisplayComp.jsx';

import ArrowGridDataComp from '../../../data/ArrowGridDataComp.jsx';
import BoundsDataComp from '../../../data/BoundsDataComp.js';
import CurveDataComp from '../../../data/CurveDataComp.js';

import funcParser from '../../../utils/funcParser.jsx';
import { round } from '../../../utils/BaseUtils.ts';

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

const initPXFuncStr = '4*x/(x^2+1)';
const initQXFuncStr = '12*x/(x^2+1)';

//------------------------------------------------------------------------
//
// primitive atoms

export const xLabelAtom = atom(initXLabel);

export const yLabelAtom = atom(initYLabel);

export const initialPointAtom = atom(initialInitialPoint);

export const pxFuncStrAtom = atom(initPXFuncStr);
export const qxFuncStrAtom = atom(initQXFuncStr);

export const {
    atom: arrowGridOptionsAtom,
    component: ArrowGridOptionsInput,
    encode: arrowGridOptionsEncode,
    decode: arrowGridOptionsDecode,
    length: agoel // agoel = arrow grid options encode length
} = ArrowGridDataComp(initArrowData);

export const {
    atom: boundsAtom,
    component: BoundsInput,
    encode: boundsEncode,
    decode: boundsDecode,
    length: bel
} = BoundsDataComp({
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
} = CurveDataComp(initSolutionCurveData);

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
    pxFuncStrAtom,
    qxFuncStrAtom
];

// should be pure function

export const encode = ([
    arrowGridOptions,
    bounds,
    solutionCurveOptions,
    xLabel,
    yLabel,
    initialPoint,
    pxFuncStr,
    qxFuncStr
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
        pxFuncStr,
        qxFuncStr
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
    func: funcParser('-(' + get(pxFuncStrAtom) + ')*y + (' + get(qxFuncStrAtom) + ')')
}));

//------------------------------------------------------------------------
//
// input components

const LatexSepEquation = '\\frac{dy}{dx} + p(x)y = q(x)';

export const LinearEquationInput = React.memo(function LinearEquationI({}) {
    const [pxFuncStr, setPXFuncStr] = useAtom(pxFuncStrAtom);
    const [qxFuncStr, setQXFuncStr] = useAtom(qxFuncStrAtom);

    const pxCB = useCallback((newStr) => setPXFuncStr(newStr), []);

    const qxCB = useCallback((newStr) => setQXFuncStr(newStr), []);

    const css2 = useRef({ padding: '.25em 0', textAlign: 'center' });

    const css3 = useRef({
        margin: '1em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '.5em 2em'
    });

    const css4 = useRef({ paddingRight: '1em' });

    const css5 = useRef({ paddingTop: '.5em' });

    return (
        <div style={css3.current}>
            <TexDisplayComp userCss={css2.current} str={LatexSepEquation} />
            <div style={css5.current}>
                <span style={css4.current}>
                    <span style={css4.current}>p(x) = </span>
                    <Input size={15} initValue={pxFuncStr} onC={pxCB} />
                </span>
                <span>
                    <span style={css4.current}>g(x) = </span>
                    <Input size={15} initValue={qxFuncStr} onC={qxCB} />
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
