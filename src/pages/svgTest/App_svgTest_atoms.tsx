import { atom } from 'jotai';

import MainDataComp from '../../data/MainDataComp.jsx';
import FunctionDataComp from '../../data/FunctionDataComp.jsx';
import AxesDataComp from '../../data/AxesDataComp.jsx';
import NumberDataComp from '../../data/NumberDataComp';
import PointDataComp from '../../data/PointDataComp';
import MatrixFactory from '../../math/MatrixFactory';

//------------------------------------------------------------------------
//
// initial constants

const initFuncStr = 'x^2 + 2x + 3';

const initAxesData = {
    radius: 0.01,
    tickRadiusMultiple: 1,
    show: true,
    tickLabelDistance: 0
};

export const initXWidth = 20;

export const initXCenter = 0;

// should be (yMax  - yMin)/2 + yMin (if we knew those already)
export const initYCenter = 0;

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
    const { x: xMax, y: yMax } = svgToMath({ x: svgxm, y: svgxn });

    return { xMin, xMax, yMin, yMax };
});

export const atomStoreAtom = atom({
    ax: axesData,
    fn: funcData,
    c: upperLeftPointData
});

export const modeAtom = atom('pan');

//export const DataComp = MainDataComp(atomStoreAtom);
