import { atom } from 'jotai';

import FunctionDataComp from '../../data/FunctionDataComp.jsx';
import AxesDataComp from '../../data/AxesDataComp.jsx';
import NumberDataComp from '../../data/NumberDataComp';
import PointDataComp from '../../data/PointDataComp';
import MatrixFactory from '../../math/MatrixFactory';
import CurveDataComp from '../../data/CurveDataComp';

//------------------------------------------------------------------------
//
// initial constants

const initFuncStr = 'sin(1/x)';

const initAxesData = {
    radius: 0.01,
    tickRadiusMultiple: 1,
    show: true,
    tickLabelDistance: 0
};

export const initXWidth = 20;
// y width will be determined by aspect ratio of svg

export const labelWidth = 1;

export const initXCenter = 0;
export const initYCenter = 0;

export const initGraphSqW = 1;

export const initApproxH = 0.01;

const initSolutionCurveData = {
    color: '#B01A46',
    approxH: 0.01,
    visible: true,
    width: 4
};

//------------------------------------------------------------------------
//
// primitive atoms

export const axesData = AxesDataComp({
    ...initAxesData
});

export const funcData = FunctionDataComp({
    initVal: initFuncStr,
    functionLabelAtom: atom('f(x) = ')
});

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

const zoomFactorButton = 2;
const zoomFactorWheel = 1.1;

// how can the zoom in button know when max is reached? (so it can be disabled)
const zoomMax = 2 ** 15;
const zoomMin = 1 / zoomMax;

export const zoomAtom = atom(
    (get) => get(zoomData.atom),
    (get, set, action) => {
        const z = get(zoomData.atom);

        switch (action) {
            case 'zoom in button':
                if (z < zoomMax) {
                    set(zoomData.atom, z * zoomFactorButton);
                }
                break;

            case 'zoom in wheel':
                if (z < zoomMax) {
                    set(zoomData.atom, z * zoomFactorWheel);
                }
                break;

            case 'zoom out button':
                if (z > zoomMin) {
                    set(zoomData.atom, z / zoomFactorButton);
                }
                break;

            case 'zoom out wheel':
                if (z > zoomMin) {
                    set(zoomData.atom, z / zoomFactorWheel);
                }
                break;

            case 'reset':
                set(zoomData.atom, 1);
                break;
        }
    }
);

export const graphSqWAtom = atom((get) => initGraphSqW / get(zoomAtom));

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

export const curveData = CurveDataComp(initSolutionCurveData);

export const atomStoreAtom = atom({
    ax: axesData,
    fn: funcData,
    c: upperLeftPointData,
    z: zoomData,
    cd: curveData
});

export const modeAtom = atom('pan');

//export const DataComp = MainDataComp(atomStoreAtom);
