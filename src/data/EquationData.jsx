import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';

import '../styles.css';

export const defaultLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

const defaultInitVal = 'x';

const identity = (x) => x;

export default function EquationData({
    initVal = defaultInitVal,
    equationLabelAtom,
    equationLabelString = 'default label string',
    inputSize = 15
}) {
    const encode = identity;
    const decode = (objStr) => {
        if (!objStr || !objStr.length || objStr.length === 0) return initVal;

        return objStr;
    };

    const equationStrAtom = atom(initVal);

    const resetAtom = atom(null, (get, set) => {
        set(equationStrAtom, initVal);
    });

    const labelAtom = equationLabelAtom ? equationLabelAtom : atom(equationLabelString);

    const comp = React.memo(() => {
        const [eqStr, setEqStr] = useAtom(equationStrAtom);
        const [equationLabel] = useAtom(labelAtom);

        const eqInputCB = useCallback((str) => setEqStr(str), [setEqStr]);

        return (
            <div>
                <span className='pr-1'>{equationLabel}</span>
                <Input size={inputSize} initValue={eqStr} onC={eqInputCB} />
            </div>
        );
    });

    return {
        atom: equationStrAtom,
        component: comp,
        resetAtom,
        encode,
        decode
    };
}
