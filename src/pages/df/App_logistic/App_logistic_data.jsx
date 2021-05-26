import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import classnames from 'classnames';
import styles from '../base_styles.module.css';

import Input from '../../../components/Input.jsx';

import ArrowGridDataComp from '../../../data/ArrowGridDataComp.jsx';
import BoundsDataComp from '../../../data/BoundsDataComp.js';
import CurveDataComp from '../../../data/CurveDataComp.js';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initArrowData = { density: 1, thickness: 1, length: 0.75, color: colors.arrows };

const initBounds = { xMin: -20, xMax: 20, yMin: 0, yMax: 40 };

const initXLabel = 't';

const initYLabel = 'x';

const initialInitialPoint = { x: 2, y: 2 };

const initSolutionCurveData = {
    color: '#C2374F',
    approxH: 0.1,
    visible: true
};

const initBVal = 10.0;
const initKVal = 1.0;

const initLineColor = '#3285ab';

const lineLabelStyle = {
    color: initLineColor,
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

//------------------------------------------------------------------------
//
// primitive atoms

export const xLabelAtom = atom(initXLabel);

export const yLabelAtom = atom(initYLabel);

export const initialPointAtom = atom(initialInitialPoint);

export const bAtom = atom(initBVal);

export const kAtom = atom(initKVal);

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
    bAtom,
    kAtom
];

// should be pure function

export const encode = ([
    arrowGridOptions,
    bounds,
    solutionCurveOptions,
    xLabel,
    yLabel,
    initialPoint,
    b,
    k
]) => {
    const agoe = arrowGridOptionsEncode(arrowGridOptions);

    const be = boundsEncode(bounds);

    const scoe = solutionCurveOptionsEncode(solutionCurveOptions);

    return [...agoe, ...be, ...scoe, xLabel, yLabel, initialPoint.x, initialPoint.y, b, k];
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
        Number(valueArray[n + 4]),
        Number(valueArray[n + 5])
    ];
}

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => {
    const k = get(kAtom);
    const b = get(bAtom);
    return { func: (x, y) => k * (1 - y / b) };
});

export const linePoint1Atom = atom((get) => {
    const xMin = get(boundsAtom).xMin;
    const b = get(bAtom);

    return [xMin, b];
});

export const linePoint2Atom = atom((get) => {
    const xMax = get(boundsAtom).xMax;
    const b = get(bAtom);

    return [xMax, b];
});

export const lineColorAtom = atom(initLineColor);

export const lineLabelAtom = atom((get) => {
    return {
        pos: [initBounds.xMax - 5, get(bAtom) + 3, 0],
        text: get(yLabelAtom) + '= ' + get(bAtom),
        style: lineLabelStyle
    };
});

//------------------------------------------------------------------------

export const VariablesOptionsInput = React.memo(function VariablesOptions({}) {
    const [xLabel, setXLabel] = useAtom(xLabelAtom);
    const [yLabel, setYLabel] = useAtom(yLabelAtom);

    const xCB = useCallback((inputStr) => setXLabel(inputStr), [setXLabel]);
    const yCB = useCallback((inputStr) => setYLabel(inputStr), [setYLabel]);

    return (
        <div className={classnames(styles['center-flex-column'], styles['med-padding'])}>
            <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                <span className={styles['text-align-center']}>Independent variable</span>
                <span className={styles['med-padding']}>
                    <Input size={4} initValue={xLabel} onC={xCB} />
                </span>
            </div>

            <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                <span className={styles['text-align-center']}>Dependent variable:</span>
                <span className={styles['med-padding']}>
                    <Input size={4} initValue={yLabel} onC={yCB} />
                </span>
            </div>
        </div>
    );
});
