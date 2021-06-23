import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import LabelDataComp from '../../../data/LabelDataComp.jsx';
import NumberDataComp from '../../../data/NumberDataComp.jsx';
import AxesDataComp from '../../../data/AxesDataComp.jsx';
import BoundsDataComp from '../../../data/BoundsDataComp';
import CurveDataComp from '../../../data/CurveDataComp';
import PointDataComp from '../../../data/PointDataComp';

import TexDisplayComp from '../../../components/TexDisplayComp.jsx';
import Slider from '../../../components/Slider.jsx';
import MatrixFactory from '../../../math/MatrixFactory';
import { processNum } from '../../../utils/BaseUtils';
//------------------------------------------------------------------------
//
// initial constants

const precision = 4;
const sliderPrecision = 2;

const colors = {
    solutionCurve: '#B01A46', //'#C2374F'
    //solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initW0Val = 4.8;
const initWVal = 4.9;
const initFVal = 4.89;

const initBounds = { xMin: -70, xMax: 70, yMin: -28, yMax: 28 };

const initAxesData = {
    radius: 0.01,
    show: true,
    tickLabelDistance: 10
};

const initSolutionCurveData = {
    color: colors.solutionCurve,
    approxH: 0.01,
    visible: true,
    width: 4
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

export const initXWidth = 10;
// y width will be determined by aspect ratio of svg

export const initXCenter = 0;
export const initYCenter = 0;

export const initApproxH = 0.01;

//------------------------------------------------------------------------
//
// primitive atoms

export const labelData = LabelDataComp({ xLabel: 't', twoD: true });
export const axesData = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});

export const solutionCurveData = CurveDataComp(initSolutionCurveData);

export const boundsData = BoundsDataComp({
    initBounds,
    labelAtom: labelData.atom
});

export const fData = NumberDataComp(initFVal);
export const wData = NumberDataComp(initWVal);
export const w0Data = NumberDataComp(initW0Val);

export const svgHeightAndWidthAtom = atom({ height: 0, width: 0 });

export const svgToMathFuncAtom = atom((get) => {
    const { height, width } = get(svgHeightAndWidthAtom);

    const scale = width / initXWidth;

    const m = MatrixFactory([
        [1 / scale, 0, initXCenter - initXWidth / 2],
        [0, -1 / scale, initYCenter + (((1 / 2) * height) / width) * initXWidth],
        [0, 0, 1]
    ]);

    const func = ({ x, y }) => {
        const vec = m.multiplyWithVec([x, y, 1]);
        return { x: vec[0], y: vec[1] };
    };

    return { func };
});

export const mathToSvgFuncAtom = atom((get) => {
    const { width, height } = get(svgHeightAndWidthAtom);

    const scale = width / initXWidth;

    const m = MatrixFactory([
        [scale, 0, width / 2],
        [0, -scale, height / 2],
        [0, 0, 1]
    ]);

    const func = ({ x, y }) => {
        const vec = m.multiplyWithVec([x, y, 1]);
        return { x: vec[0], y: vec[1] };
    };

    return { func };
});

export const zoomData = NumberDataComp(1);

const zoomFactor = 2;

const zoomMax = 2 ** 15;
const zoomMin = 1 / zoomMax;

// how can the zoom in button know when max is reached? (so it can be disabled)

export const zoomAtom = atom(
    (get) => get(zoomData.atom),
    (get, set, action) => {
        const z = get(zoomData.atom);

        switch (action) {
            case 'zoom in':
                if (z < zoomMax) {
                    set(zoomData.atom, zoomFactor * z);
                }
                break;

            case 'zoom out':
                if (z > zoomMin) {
                    set(zoomData.atom, z / zoomFactor);
                }
                break;

            case 'reset':
                set(zoomData.atom, 1);
                break;
        }
    }
);

export const upperLeftPointData = PointDataComp({ x: 0, y: 0 });

export const svgBoundsAtom = atom((get) => {
    const zoom = get(zoomData.atom);
    const { height, width } = get(svgHeightAndWidthAtom);
    const { x: ulX, y: ulY } = get(upperLeftPointData.atom);

    const svgCenterX = width / 2 + ulX;
    const svgCenterY = height / 2 + ulY;

    const xMin = svgCenterX - width / (2 * zoom);
    const xMax = svgCenterX + width / (2 * zoom);
    const yMin = svgCenterY - height / (2 * zoom);
    const yMax = svgCenterY + height / (2 * zoom);

    //console.log('svgBounds = ', { xMin, xMax, yMin, yMax });

    return { xMin, xMax, yMin, yMax };
});

export const mathBoundsAtom = atom((get) => {
    const { xMin: svgxn, xMax: svgxm, yMin: svgyn, yMax: svgym } = get(svgBoundsAtom);
    const svgToMath = get(svgToMathFuncAtom).func;

    const { x: xMin, y: yMin } = svgToMath({ x: svgxn, y: svgym });
    const { x: xMax, y: yMax } = svgToMath({ x: svgxm, y: svgyn });

    return { xMin, xMax, yMin, yMax };
});

export const atomStoreAtom = atom({
    ls: labelData,
    ax: axesData,
    sc: solutionCurveData,
    bd: boundsData,
    f: fData,
    w: wData,
    w0: w0Data,
    c: upperLeftPointData,
    z: zoomData
});

export const modeAtom = atom('pan');

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => {
    const f = get(fData.atom);
    const w = get(wData.atom);
    const w0 = get(w0Data.atom);

    if (w != w0) {
        const A = f / (w0 * w0 - w * w);

        return { func: (t) => A * (Math.cos(w * t) - Math.cos(w0 * t)) };
    }

    return { func: (t) => (f / (2 * w)) * t * Math.sin(w * t) };
});

export const solnStrAtom = atom((get) => {
    {
        const f = get(fData.atom);
        const w = get(wData.atom);
        const w0 = get(w0Data.atom);

        const { x, y } = get(labelData.atom);

        if (w != w0) {
            const A = f / (w0 * w0 - w * w);

            return `${y}=${
                processNum(A, precision - 1).texStr
            }( \\cos(${w}${x}) - \\cos(${w0}${x}))`;
        }

        return `${y}=${
            processNum(f / (2 * w0), precision).texStr
        } \\cdot ${x}\\cdot\\sin(${w}${x})`;
    }
});

//------------------------------------------------------------------------
//

const fMin = 0.1;
const fMax = 10;
const w0Min = 0.1;
const w0Max = 10;
const wMin = 0.1;
const wMax = 10;

const step = 0.01;

const resonanceEqTexAtom = atom((get) => {
    const { x, y } = get(labelData.atom);

    return `\\ddot{${y}} + \\omega_0^2 ${y} = f \\cos( \\omega ${x} )`;
});

const initialCondsTexAtom = atom((get) => {
    const { y } = get(labelData.atom);

    return `${y}(0) = 0, \\, \\, \\dot{${y}}(0) = 0`;
});

export function SecondOrderInput() {
    const { x: xLabel, y: yLabel } = useAtom(labelData.atom)[0];

    const [f, setF] = useAtom(fData.atom);
    const [w, setW] = useAtom(wData.atom);
    const [w0, setW0] = useAtom(w0Data.atom);

    const solnStr = useAtom(solnStrAtom)[0];

    const resonanceEqTex = useAtom(resonanceEqTexAtom)[0];
    const initialCondsTex = useAtom(initialCondsTexAtom)[0];

    const ATexStr = `A = \\frac{f}{\\omega_0^2 - \\omega^2} = ${
        processNum(f / (w0 * w0 - w * w), precision).texStr
    }`;

    return (
        <div
            className='flex justify-around items-center h-full py-2
            px-4 text-xl m-0'
        >
            <div
                className='m-0 flex flex-col justify-center
		content-center py-2 pr-8 lg:pr-16 hidden xl:block'
            >
                <div className='pb-2 px-0 whitespace-nowrap'>
                    <TexDisplayComp str={resonanceEqTex} />
                </div>
                <div>
                    <TexDisplayComp str={initialCondsTex} />
                </div>
            </div>

            <div
                className='m-0 flex flex-col justify-center
		content-center py-2 px-8 lg:px-16'
            >
                <div className='py-1'>
                    <Slider
                        value={w0}
                        CB={(val) => setW0(Number.parseFloat(val))}
                        label={'w0'}
                        max={w0Max}
                        min={w0Min}
                        step={step}
                        precision={sliderPrecision}
                    />
                </div>
                <div className='py-1'>
                    <Slider
                        value={w}
                        CB={(val) => setW(Number.parseFloat(val))}
                        label={'w'}
                        max={wMax}
                        min={wMin}
                        step={step}
                        precision={sliderPrecision}
                    />
                </div>
                <div className='py-1'>
                    <Slider
                        value={f}
                        CB={(val) => setF(Number.parseFloat(val))}
                        label={'f'}
                        max={fMax}
                        min={fMin}
                        step={step}
                        precision={sliderPrecision}
                    />
                </div>
            </div>
            <div
                className='m-0 flex flex-col justify-center
		content-center py-2 px-16'
            >
                <div
                    className='m-0 flex flex-col justify-center
		    content-center py-2 px-4 hidden xl:block'
                >
                    <TexDisplayComp str={ATexStr} />
                </div>
                <div className='py-1 text-m whitespace-no-wrap'>
                    <TexDisplayComp str={solnStr} />
                </div>
            </div>
        </div>
    );
}
