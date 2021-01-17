import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

import EquationData from './EquationData.jsx';

import '../styles.css';

const globalDefaultData = {
    funcStr: 'x*y*sin(x^2 + y)/100',
    bounds: {
        xMin: -20,
        xMax: 20,
        yMin: -20,
        yMax: 20
    },
    meshSize: 100,
    color: '#E53935'
};

const identity = (x) => x;

export default function FunctionData({ funcStr, labelAtom, inputSize = 20 }) {
    let initData = globalDefaultData;

    if (funcStr) initData = { ...initData, funcStr };

    const encode = identity;
    const decode = (objStr) => {
        if (!objStr || !objStr.length || objStr.length === 0) return initData;

        return objStr;
    };

    const funcInputLabelAtom = atom(
        (get) => 'f(' + get(labelAtom).x + ',' + get(labelAtom).y + ') = '
    );

    const {
        atom: funcStrAtom,
        component: FuncStrInput,
        encode: funcStrEncode,
        decode: funcStrDecode
    } = EquationData({ initVal: initData.funcStr, equationLabelAtom: funcInputLabelAtom });

    const dataAtom = atomWithReset(initData);

    const InputComponent = React.memo(() => {
        return null;
    });

    return {
        atom: dataAtom,
        component: FuncStrInput,
        encode,
        decode
    };
}
