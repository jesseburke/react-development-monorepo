import { atom, useAtom } from 'jotai';
import { useAtomCallback, useUpdateAtom, atomWithReset } from 'jotai/utils';

import MainDataComp from '../../data/MainDataComp.jsx';
import LabelDataComp from '../../data/LabelDataComp.jsx';
import FunctionDataComp from '../../data/FunctionDataComp.jsx';
import AxesDataComp from '../../data/AxesDataComp.jsx';
import BoundsDataComp from '../../data/BoundsDataComp';
import PerspCameraDataComp from '../../data/PerspCameraDataComp';

import { Bounds } from '../../my-types';

//------------------------------------------------------------------------
//
// initial constants

const colors = {
    arrows: '#B01A46', //'#C2374F'
    solutionCurve: '#4e6d87', //'#C2374F'
    tick: '#e19662'
};

const initFuncStr = 'x*y*sin(x+y)/10';

const initAxesData = {
    radius: 0.01,
    tickRadiusMultiple: 20,
    show: true,
    tickLabelDistance: 0
};

const initBounds: Bounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20, zMin: -20, zMax: 20 };

const initCameraData = {
    target: [0, 0, 0],
    position: [29, 64, 36]
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

//------------------------------------------------------------------------
//
// primitive atoms

export const labelData = LabelDataComp();
export const axesData = AxesDataComp({
    ...initAxesData,
    tickLabelStyle
});

export const funcData = FunctionDataComp({
    initVal: initFuncStr,
    functionLabelAtom: atom(
        (get) => 'f(' + get(labelData.atom).x + ',' + get(labelData.atom).y + ') = '
    ),
    labelAtom: labelData.atom
});

export const boundsData = BoundsDataComp({
    initBounds,
    labelAtom: labelData.atom
});

const gridOverhang = 10;

export const gridBoundsAtom = atom((get) => {
    const { xMin, xMax, yMin, yMax, zMin, zMax } = get(boundsData.atom);

    return {
        xMin: xMin - gridOverhang,
        xMax: xMax + gridOverhang,
        yMin: yMin - gridOverhang,
        yMax: yMax + gridOverhang,
        zMin: zMin - gridOverhang,
        zMax: zMax + gridOverhang
    };
});

export const cameraData = PerspCameraDataComp(initCameraData);

const atomStoreAtom = atom({
    ls: labelData,
    ax: axesData,
    fn: funcData,
    bd: boundsData,
    cd: cameraData
});

export const DataComp = MainDataComp(atomStoreAtom);