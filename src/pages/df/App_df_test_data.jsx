import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';

import queryString from 'query-string-esm';

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
// turn the atom value into a string;

const atomStore = {
    xl: [xLabelAtom, (x) => (x ? x.toString() : null)],
    yl: [yLabelAtom, (x) => (x ? x.toString() : null)],
    ip: [initialPointAtom, JSON.stringify],
    fs: [funcStrAtom, (x) => (x ? x.toString() : null)],
    ag: [arrowGridDataAtom, arrowGridDataEncode],
    ax: [axesDataAtom, axesDataEncode],
    bd: [boundsAtom, boundsDataEncode],
    sc: [solutionCurveDataAtom, curveDataEncode]
};

// function will take as input an object like the atomStore
// above. will return saveCB

function useSaveToAddressBar(atomStore) {
    const [saveStr, setSaveStr] = useState();

    const readAtoms = useAtomCallback(
        useCallback((get) => {
            const objToReturn = {};

            Object.entries(atomStore).map(([abbrev, [at, func]]) => {
                const newValue = func(get(at));

                // don't need to put empty strings in address bar
                if (!newValue || newValue.length === 0) return;

                objToReturn[abbrev] = newValue;
            });

            //console.log(returnObj);
            //console.log(queryString.stringify(returnObj));
            //console.log(queryString.parse(queryString.stringify(returnObj)));

            return queryString.stringify(objToReturn);
        }, [])
    );

    const saveCB = useCallback(() => {
        readAtoms().then((str) => setSaveStr(str));
    }, [readAtoms]);

    // whenever saveStr changes, update the search bar
    useEffect(() => {
        if (!saveStr || saveStr.length === 0) return;

        window.history.replaceState(null, null, '?' + saveStr);
    }, [saveStr]);

    return saveCB;
}

export function SaveComp({ children }) {
    const saveCB = useSaveToAddressBar(atomStore);

    // on load parse the address bar data and dole it out to atoms
    useEffect(() => {
        const qsObj = queryString.parse(window.location.search.slice(1));

        console.log(qsObj);
    }, []);

    // could put following into 'default save button' component, if
    // wanted to make this component smaller (e.g., if add code to
    // write to atoms
    const cssRef = useRef({
        position: 'absolute',
        top: '85%',
        left: '5%',
        padding: '1%',
        border: '1px',
        borderStyle: 'solid',
        borderRadius: '50%',
        // next line stops cursor from changing to text selection on hover
        cursor: 'pointer'
    });

    const cssRef2 = useRef({ padding: '.15em', fontSize: '2rem' });

    const component = children ? (
        React.cloneElement(children[0], { onClick: saveCB })
    ) : (
        <div style={cssRef.current} onClick={saveCB}>
            <span style={cssRef2.current}>{'\u{1F4BE}'}</span>
        </div>
    );

    return component;
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
