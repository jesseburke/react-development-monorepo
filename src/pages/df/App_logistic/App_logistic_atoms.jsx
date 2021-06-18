import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import LabelDataComp from '../../../data/LabelDataComp.jsx';
import PointDataComp from '../../../data/PointDataComp.jsx';
import NumberDataComp from '../../../data/NumberDataComp.jsx';
import ArrowGridDataComp from '../../../data/ArrowGridDataComp.jsx';
import AxesDataComp from '../../../data/AxesDataComp.jsx';
import BoundsDataComp from '../../../data/BoundsDataComp';
import CurveDataComp from '../../../data/CurveDataComp';
import OrthoCameraDataComp from '../../../data/OrthoCameraDataComp';

import TexDisplayComp from '../../../components/TexDisplayComp.jsx';
import Slider from '../../../components/Slider.jsx';

//------------------------------------------------------------------------
//
// initial constants

const precision = 3;

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initArrowData = { density: 1, thickness: 1, length: 0.75, color: colors.arrows };

const initBounds = { xMin: -20, xMax: 20, yMin: 0, yMax: 22 };

const initInitialPoint = { x: 0, y: 6 };

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.1,
    visible: true,
    width: 0.1
};

const initBVal = 10.0;
const initKVal = 1.0;

const initAxesData = {
    radius: 0.01,
    show: true,
    tickLabelDistance: 5
};

const initCameraData = {
    target: [0, 11, 0],
    zoom: 0.185,
    position: [0, 11, 50]
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

const initLineColor = '#3285ab';

const lineLabelStyle = {
    color: initLineColor,
    padding: '0em',
    margin: '0em',
    fontSize: '1.75em'
};

//------------------------------------------------------------------------
//
// primitive atoms

export const labelData = LabelDataComp({ twoD: true });
export const initialPointData = PointDataComp(initInitialPoint);
export const arrowGridData = ArrowGridDataComp(initArrowData);
export const axesData = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});
export const solutionCurveData = CurveDataComp(initSolutionCurveData);

export const boundsData = BoundsDataComp({
    initBounds,
    labelAtom: labelData.atom
});

export const orthoCameraData = OrthoCameraDataComp(initCameraData);

export const bData = NumberDataComp(initBVal);
export const kData = NumberDataComp(initKVal);

export const atomStoreAtom = atom({
    ls: labelData,
    ip: initialPointData,
    ag: arrowGridData,
    ax: axesData,
    sc: solutionCurveData,
    bd: boundsData,
    cd: orthoCameraData,
    b: bData,
    k: kData
});

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => {
    const k = get(kData.atom);
    const b = get(bData.atom);
    return { func: (x, y) => k * (1 - y / b) };
});

export const linePoint1Atom = atom((get) => {
    const xMin = get(boundsData.atom).xMin;
    const b = get(bData.atom);

    return [xMin, b];
});

export const linePoint2Atom = atom((get) => {
    const xMax = get(boundsData.atom).xMax;
    const b = get(bData.atom);

    return [xMax, b];
});

export const lineColorAtom = atom(initLineColor);

export const lineLabelAtom = atom((get) => {
    return {
        pos: [initBounds.xMax - 5, get(bData.atom) + 3, 0],
        text: get(labelData.atom).y + '= ' + get(bData.atom),
        style: lineLabelStyle
    };
});

function theta(a) {
    return Math.asin(a / Math.sqrt(a * a + 1));
}

export const zHeightAtom = atom((get) => {
    const f = get(funcAtom).func;

    return { func: (x, y) => 3 * theta(f(x, y)) };
});

//------------------------------------------------------------------------
//

export function LogisticEquationInput() {
    const { x: xLabel, y: yLabel } = useAtom(labelData.atom)[0];

    const [b, setB] = useAtom(bData.atom);
    const [k, setK] = useAtom(kData.atom);
    const { yMax } = useAtom(boundsData.atom)[0];

    const [texEquation, setTexEquation] = useState();

    useEffect(() => {
        setTexEquation(
            `\\frac{d ${yLabel} }{d ${xLabel} } = k ${yLabel} (1 - \\frac{ ${yLabel} }{b})`
        );
    }, [xLabel, yLabel]);

    const bCB = useCallback(
        (num) => {
            setB(Number.parseFloat(num));
        },
        [setB]
    );

    const kCB = useCallback(
        (num) => {
            setK(Number.parseFloat(num));
        },
        [setK]
    );

    return (
        <div
            className='flex justify-center items-center h-full py-2
        px-8 text-xl m-0'
        >
            <div
                className='m-0 flex flex-col justify-center
        content-center py-0 pr-16'
            >
                <div className='text- pb-2 px-0'>Logistic equation</div>
                <TexDisplayComp str={texEquation} />
            </div>
            <div className='pr-4 pt-2'>
                <Slider
                    value={b}
                    CB={bCB}
                    label={'b'}
                    max={yMax}
                    min={0.01}
                    precision={precision}
                />
            </div>
            <div className='pt-2'>
                <Slider value={k} CB={kCB} label={'k'} max={100} min={0.01} precision={precision} />
            </div>
        </div>
    );
}
