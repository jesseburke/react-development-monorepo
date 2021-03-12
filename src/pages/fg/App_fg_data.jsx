import { atom, useAtom } from 'jotai';
import { useAtomCallback, useUpdateAtom, atomWithReset } from 'jotai/utils';

import MainDataComp from '../../data/MainDataComp.jsx';
import LabelData from '../../data/LabelData.jsx';
import PointData from '../../data/PointData.jsx';
import FunctionData from '../../data/FunctionData.jsx';
import ArrowGridData from '../../data/ArrowGridData.jsx';
import AxesData from '../../data/AxesData.jsx';
import BoundsData from '../../data/BoundsData.js';
import CurveData from '../../data/CurveData.js';

import funcParser from '../../utils/funcParser.jsx';

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
    show: true,
    tickLabelDistance: 5
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

export const {
    atom: labelAtom,
    component: LabelInput,
    encode: labelEncode,
    decode: labelDecode
} = LabelData({});

export const {
    atom: funcDataAtom,
    component: FuncStrInput,
    encode: funcStrEncode,
    decode: funcStrDecode,
    threeComp: FuncGraphComponent
} = FunctionData({ labelAtom });

export const {
    atom: axesDataAtom,
    component: AxesDataInput,
    encode: axesDataEncode,
    decode: axesDataDecode
} = AxesData({
    ...initAxesData,
    tickLabelStyle
});

//------------------------------------------------------------------------
//
// the first entry in each array is the atom; the second is a function to
// turn the atom value into a string; third entry is a function that takes a
// string and returns an object, should be inverse to the second
// argument.

const atomStore = {
    ls: [labelAtom, labelEncode, labelDecode],
    fs: [funcDataAtom, funcStrEncode, funcStrDecode],
    ax: [axesDataAtom, axesDataEncode, axesDataDecode]
};

export const DataComp = MainDataComp(atomStore);

//------------------------------------------------------------------------
//
// derived atoms

export const funcAtom = atom((get) => ({
    func: funcParser(get(funcStrAtom))
}));
