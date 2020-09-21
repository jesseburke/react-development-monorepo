import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import classnames from 'classnames';
import styles from './base_styles.module.css';

import Input from '../../components/Input.jsx';
import TexDisplayComp from '../../components/TexDisplayComp.jsx';
import Slider from '../../components/Slider.jsx';

import BoundsData from '../../data/BoundsData.jsx';
import CurveData from '../../data/CurveData.jsx';

import funcParser from '../../utils/funcParser.jsx';
import { round } from '../../utils/BaseUtils.jsx';
import { processNum } from '../../utils/BaseUtils.jsx';

import { solnStrs } from '../../math/differentialEquations/secOrderConstantCoeff.jsx';

//------------------------------------------------------------------------
//
// initial constants

const initBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

const initXLabel = 'x';
const initYLabel = 'y';

const initAVal = 0.2;
const initBVal = 3.0;

const initialInitialPoint1 = { x: 4, y: 7 };
const initialInitialPoint2 = { x: 7, y: 5 };

const initialPoint1Color = '#C2374F';
const initialPoint2Color = '#C2374F';

const initSolutionCurveData = {
    color: '#C2374F',
    approxH: 0.1,
    visible: true,
    width: 0.1
};

// will have -abBound < a^2 - 4b > abBound
const abBound = 20;
const aMax = 5;
const aMin = -5;
const aStep = 0.1;

const initPrecision = 4;
const sliderPrecision = 3;

const texEquation = '\\ddot{y} + a \\cdot \\dot{y} + b \\cdot y  = 0';
//'(\\frac{d}{dx})^2(y) + a \\cdot \\frac{d}{dx}(y) + b \\cdot y  = 0';

//------------------------------------------------------------------------
//
// primitive atoms

export const xLabelAtom = atom(initXLabel);
export const yLabelAtom = atom(initYLabel);

export const aValAtom = atom(initAVal);
export const bValAtom = atom(initBVal);

export const initialPoint1Atom = atom(initialInitialPoint1);
export const initialPoint2Atom = atom(initialInitialPoint2);

export const initialPoint1ColorAtom = atom(initialPoint1Color);
export const initialPoint2ColorAtom = atom(initialPoint2Color);

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

export const texEquationAtom = atom(texEquation);

//------------------------------------------------------------------------
//
// encode and decode functions for primitive atoms
//

// everything depends on order of following:

export const atomArray = [
    boundsAtom,
    solutionCurveOptionsAtom,
    xLabelAtom,
    yLabelAtom,
    initialPoint1Atom,
    initialPoint2Atom
];

// should be pure function

export const encode = ([
    bounds,
    solutionCurveOptions,
    xLabel,
    yLabel,
    initialPoint,
    pxFuncStr,
    qxFuncStr
]) => {
    const be = boundsEncode(bounds);

    const scoe = solutionCurveOptionsEncode(solutionCurveOptions);

    return [...be, ...scoe, xLabel, yLabel, initialPoint.x, initialPoint.y, pxFuncStr, qxFuncStr];
};

// this function expects an array in the form returned by encode,
// returns an array that can be cycled through and used to set the
// value of each atom (this has to be done in react)
export function decode(valueArray) {
    // aga = arrow grid array
    const ba = valueArray.slice(0, bel);
    const scoa = valueArray.slice(bel, bel + scoel);

    const n = bel + scoel;

    return [
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

export const solnStrsAtom = atom((get) =>
    solnStrs(Number.parseFloat(get(aValAtom)), Number.parseFloat(get(bValAtom)), [
        [get(initialPoint1Atom).x, get(initialPoint1Atom).y],
        [get(initialPoint2Atom).x, get(initialPoint2Atom).y]
    ])
);

export const solnTexStrAtom = atom((get) => get(solnStrsAtom).texStr);

export const funcAtom = atom((get) => ({
    func: funcParser(get(solnStrsAtom).str)
}));

export const aStrAtom = atom((get) => processNum(get(aValAtom), initPrecision).str);
export const bStrAtom = atom((get) => processNum(get(bValAtom), initPrecision).str);

//------------------------------------------------------------------------
//
// input components

// this isn't ideal to build with because the display is fixed, e.g., the 'Initial Point: '

const InitialPointInput = React.memo(({ ipAtom }) => {
    const [initialPoint, setInitialPoint] = useAtom(ipAtom);

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

const useInitialPoint = React.memo(({ ipAtom }) => {
    const [initialPoint, setInitialPoint] = useAtom(ipAtom);

    const setX = useCallback((newX) => setInitialPoint((old) => ({ ...old, x: Number(newX) })), [
        setInitialPoint
    ]);
    const setY = useCallback((newY) => setInitialPoint((old) => ({ ...old, y: Number(newY) })), [
        setInitialPoint
    ]);

    return [initialPoint, setX, setY];
});

export const InitialPointsInput = React.memo(({}) => {
    return (
        <div>
            <InitialPointInput ipAtom={initialPoint1Atom} />
            <InitialPointInput ipAtom={initialPoint2Atom} />
        </div>
    );
});

export const CoefficientInput = React.memo(function CoeffInput({}) {
    const [aVal, setAVal] = useAtom(aValAtom);
    const [bVal, setBVal] = useAtom(bValAtom);

    const [aStr] = useAtom(aStrAtom);
    const [bStr] = useAtom(bStrAtom);

    const aCB = useCallback((val) => setAVal(Number.parseFloat(val)), [setAVal]);
    const bCB = useCallback((val) => setBVal(Number.parseFloat(val)), [setBVal]);

    return (
        <div className={classnames(styles['center-flex-column'])}>
            <Slider
                value={aStr}
                label={'a'}
                CB={aCB}
                max={aMax}
                min={aMin}
                step={aStep}
                precision={sliderPrecision}
            />

            <Slider
                value={bStr}
                label={'b'}
                CB={bCB}
                min={(aVal * aVal - abBound) / 4}
                max={(aVal * aVal + abBound) / 4}
                precision={sliderPrecision}
            />
        </div>
    );
});
