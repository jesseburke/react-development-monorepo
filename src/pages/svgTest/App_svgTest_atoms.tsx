import { atom, useAtom } from 'jotai';
import { useAtomCallback, useUpdateAtom, atomWithReset } from 'jotai/utils';

import MainDataComp from '../../data/MainDataComp.jsx';
import LabelDataComp from '../../data/LabelDataComp.jsx';
import FunctionDataComp from '../../data/FunctionDataComp.jsx';
import AxesDataComp from '../../data/AxesDataComp.jsx';
import BoundsDataComp from '../../data/BoundsDataComp';
import NumberDataComp from '../../data/NumberDataComp';
import PointDataComp from '../../data/PointDataComp';

import { Bounds } from '../../my-types';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initFuncStr = 'x^2 + 2x + 3';

const initAxesData = {
    radius: 0.01,
    tickRadiusMultiple: 1,
    show: true,
    tickLabelDistance: 0
};

const initBounds: Bounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20, zMin: -20, zMax: 20 };

const zoom1HalfWidth = 20;

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

export const zoomData = NumberDataComp(1);

export const upperLeftPointData = PointDataComp({ x: 0, y: 0 });

export const boundsAtom = atom((get) => {
    const { height, width } = get(svgHeightAndWidthAtom);
    const zoom = get(zoomData.atom);
    const center = get(upperLeftPointData.atom);

    const zw = zoom1HalfWidth;
    const zl = width === 0 ? 0 : (zw * height) / width;

    const xMin = center.x - zw / zoom;
    const xMax = center.x + zw / zoom;
    const yMin = center.y - zl / zoom;
    const yMax = center.y + zl / zoom;

    return { xMin, xMax, yMin, yMax };
});

export const mathToSvgFuncAtom = atom((get) => {
    const { xMin, yMin, xMax, yMax } = get(boundsAtom);
    const { height, width } = get(svgHeightAndWidthAtom);

    const func = ({ x, y }) => {
        const xt = (x - xMin) / (xMax - xMin);
        const yt = (y - yMin) / (yMax - yMin);

        return { x: xt * width, y: yt * height };
    };

    return { func };
});

const atomStoreAtom = atom({
    ax: axesData,
    fn: funcData,
    z: zoomData,
    c: upperLeftPointData
});

export const DataComp = MainDataComp(atomStoreAtom);
