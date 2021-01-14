import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import classnames from 'classnames';
import styles from '../base_styles.module.css';

import Input from '../../../components/Input.jsx';
import TexDisplayComp from '../../../components/TexDisplayComp.jsx';
import TexDisplayCompR from '../../../components/TexDisplayCompRecoil.jsx';
import Slider from '../../../components/Slider.jsx';

import AxesData from '../../../data/Axes2DData.jsx';
import BoundsData from '../../../data/BoundsData.jsx';
import CurveData from '../../../data/CurveData.jsx';

import funcParser from '../../../utils/funcParser.jsx';
import { round } from '../../../utils/BaseUtils.jsx';
import { processNum } from '../../../utils/BaseUtils.jsx';

import { solnStrs } from '../../../math/differentialEquations/secOrderConstantCoeff.jsx';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662',
    solutionCurve: '#C2374F',
    point1: '#C2374F',
    point2: '#C2374F'
};

const initBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

const initXLabel = 'x';
const initYLabel = 'y';

const initAVal = 0.2;
const initBVal = 3.0;

const initialInitialPoint1 = { x: 4, y: 7 };
const initialInitialPoint2 = { x: 7, y: 5 };

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 0.1
};

const initAxesData = {
    radius: 0.01,
    show: true,
    showLabels: true,
    tickRadiusMultiple: 5
};

// will have -abBound < a^2 - 4b > abBound
const abBound = 20;
const aMax = 5;
const aMin = -5;
const aStep = 0.1;

const initPrecision = 4;
const sliderPrecision = 3;

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

export const aValAtom = atom(initAVal);
export const bValAtom = atom(initBVal);

export const initialPoint1Atom = atom(initialInitialPoint1);
export const initialPoint2Atom = atom(initialInitialPoint2);

export const initialPoint1ColorAtom = atom(colors.point1);
export const initialPoint2ColorAtom = atom(colors.point2);

export const {
    atom: boundsAtom,
    component: BoundsInput,
    encode: boundsEncode,
    decode: boundsDecode,
    length: boundsDataLength
} = BoundsData({
    initBounds,
    xLabelAtom,
    yLabelAtom
});

export const {
    atom: axesDataAtom,
    component: Axes2DDataInput,
    encode: axesDataEncode,
    decode: axesDataDecode
} = AxesData({
    ...initAxesData,
    tickLabelStyle
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
    boundsAtom,
    solutionCurveOptionsAtom,
    aValAtom,
    bValAtom,
    xLabelAtom,
    yLabelAtom,
    initialPoint1Atom,
    initialPoint2Atom
];

// should be pure function

export const encode = ([
    bounds,
    solutionCurveOptions,
    aVal,
    bVal,
    xLabel,
    yLabel,
    initialPoint1,
    initialPoint2
]) => {
    const be = boundsEncode(bounds);

    const scoe = solutionCurveOptionsEncode(solutionCurveOptions);

    return [
        ...be,
        ...scoe,
        aVal,
        bVal,
        xLabel,
        yLabel,
        initialPoint1.x,
        initialPoint1.y,
        initialPoint2.x,
        initialPoint2.y
    ];
};

// this function expects an array in the form returned by encode,
// returns an array that can be cycled through and used to set the
// value of each atom (this has to be done in react)
export function decode(valueArray) {
    // aga = arrow grid array
    const ba = valueArray.slice(0, boundsDataLength);
    const scoa = valueArray.slice(boundsDataLength, boundsDataLength + scoel);

    const n = boundsDataLength + scoel;

    return [
        boundsDecode(ba),
        solutionCurveOptionsDecode(scoa),
        Number(valueArray[n]),
        Number(valueArray[n + 1]),
        valueArray[n + 2],
        valueArray[n + 3],
        { x: Number(valueArray[n + 4]), y: Number(valueArray[n + 5]) },
        { x: Number(valueArray[n + 6]), y: Number(valueArray[n + 7]) }
    ];
}

//------------------------------------------------------------------------
//
// derived atoms

export const texEquationAtom = atom(
    (get) =>
        '\\ddot{' +
        get(yLabelAtom) +
        '} + a \\cdot \\dot{' +
        get(yLabelAtom) +
        '} + b \\cdot ' +
        get(yLabelAtom) +
        '  = 0'
);

export const solnAtom = atom((get) => {
    const ss = solnStrs(Number.parseFloat(get(aValAtom)), Number.parseFloat(get(bValAtom)), [
        [get(initialPoint1Atom).x, get(initialPoint1Atom).y],
        [get(initialPoint2Atom).x, get(initialPoint2Atom).y]
    ]);

    const func = funcParser(ss.str);

    // a and b are for debugging
    return Object.assign({ func, a: get(aValAtom), b: get(bValAtom) }, ss);
});
export const solnTexStrAtom = atom((get) => get(solnAtom).texStr);

//------------------------------------------------------------------------
//
// input components

const useInitialPoint = (ipAtom) => {
    const [initialPoint, setInitialPoint] = useAtom(ipAtom);

    const setX = useCallback((newX) => setInitialPoint((old) => ({ ...old, x: Number(newX) })), [
        setInitialPoint
    ]);
    const setY = useCallback((newY) => setInitialPoint((old) => ({ ...old, y: Number(newY) })), [
        setInitialPoint
    ]);

    return { initialPoint, setX, setY };
};

export const InitialPointsInput = React.memo(({}) => {
    const { initialPoint: ip1, setX: ip1setX, setY: ip1setY } = useInitialPoint(initialPoint1Atom);
    const { initialPoint: ip2, setX: ip2setX, setY: ip2setY } = useInitialPoint(initialPoint2Atom);

    const yLabel = useAtom(yLabelAtom)[0];

    return (
        <div
            className={classnames(
                styles['center-flex-column'],
                styles['zero-large-top-side-padding'],
                styles['font-size-med-large']
            )}
        >
            <fieldset>
                <legend>Initial Conditions</legend>

                <div className={classnames(styles['med-vlarge-top-side-padding'])}>
                    <span>{yLabel + '('}</span>
                    <Input initValue={ip1.x} onC={ip1setX} size={4} /> <span>) = </span>
                    <Input initValue={ip1.y} onC={ip1setY} size={4} />
                </div>
                <div className={classnames(styles['med-vlarge-top-side-padding'])}>
                    <span>{yLabel + '\u{0307}'}(</span>
                    <Input initValue={ip2.x} onC={ip2setX} size={4} />
                    <span>) = </span>
                    <Input initValue={ip2.y} onC={ip2setY} size={4} />
                </div>
            </fieldset>
        </div>
    );
});

export const CoefficientInput = React.memo(function CoeffInput({}) {
    const [aVal, setAVal] = useAtom(aValAtom);
    const [bVal, setBVal] = useAtom(bValAtom);

    const aCB = useCallback((val) => setAVal(Number.parseFloat(val)), [setAVal]);
    const aInputCB = useCallback(
        (str) => {
            setAVal(Number(str));
        },
        [setAVal]
    );

    const bCB = useCallback((val) => setBVal(Number.parseFloat(val)), [setBVal]);
    const bInputCB = useCallback((str) => setBVal(Number(str)), [setBVal]);

    return (
        <div className={classnames(styles['center-flex-column'])}>
            <Slider
                value={aVal}
                label={'a'}
                CB={aCB}
                max={aMax}
                min={aMin}
                step={aStep}
                precision={sliderPrecision}
            />
            <div>
                <span>a = </span>
                <Input onC={aInputCB} initValue={aVal} size={4} />
            </div>
            <Slider
                value={bVal}
                label={'b'}
                CB={bCB}
                min={(aVal * aVal - abBound) / 4}
                max={(aVal * aVal + abBound) / 4}
                precision={sliderPrecision}
            />
            <div>
                <span>b = </span>
                <Input onC={bInputCB} initValue={bVal} size={4} />
            </div>
        </div>
    );
});

export const TitleEquationComp = React.memo(({}) => {
    return (
        <div
            className={classnames(
                styles['center-flex-column'],
                styles['font-size-med-large'],
                styles['zero-margin']
            )}
        >
            <div
                className={classnames(
                    styles['small-zero-top-side-padding'],
                    styles['text-align-center']
                )}
            >
                2nd order linear, w/ constant coefficients
            </div>
            <div
                className={classnames(
                    styles['white-space-no-wrap'],
                    styles['small-zero-top-side-padding'],
                    styles['font-size-med-large']
                )}
            >
                <TexDisplayCompR strAtom={texEquationAtom} />
            </div>
        </div>
    );
});

export const SolutionDisplayComp = React.memo(({}) => {
    return (
        <div
            className={classnames(
                styles['med-zero-top-side-padding'],
                styles['center-flex-column'],
                styles['fixed-width-twelve-em']
            )}
        >
            <div>Solution:</div>
            <div
                className={classnames(
                    styles['white-space-no-wrap'],
                    styles['small-zero-top-side-padding']
                )}
            >
                <TexDisplayCompR strAtom={solnTexStrAtom} />
            </div>
        </div>
    );
});

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

export const CaseDisplay = React.memo(() => {
    const a = useAtom(aValAtom)[0];
    const b = useAtom(bValAtom)[0];

    const [str, setStr] = useState();
    const [cse, setCase] = useState();

    useEffect(() => {
        const n = round(a * a - 4 * b);

        if (n > 0) {
            setCase(1);
            setStr('a^2 - 4b = ' + n + ' > 0');
            return;
        }

        if (n < 0) {
            setCase(2);
            setStr('a^2 - 4b = ' + n + ' < 0');
            return;
        }

        if (n === 0) {
            setCase(3);
            setStr('a^2 - 4b = ' + n + ' = 0');
            return;
        }
    }, [a, b]);

    return (
        <div
            className={classnames(
                styles['center-flex-column'],
                styles['font-size-med-large'],
                styles['zero-margin']
            )}
        >
            <div
                className={classnames(
                    styles['small-zero-top-side-padding'],
                    styles['text-align-center']
                )}
            >
                <TexDisplayComp str={str} />
            </div>
            <div
                className={classnames(
                    styles['small-zero-top-side-padding'],
                    styles['text-align-center']
                )}
            >
                <span>Case {cse}</span>
            </div>
        </div>
    );
});
