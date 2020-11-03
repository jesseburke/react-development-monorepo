import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';
import { diffObjects, round } from '../utils/BaseUtils.jsx';

import classnames from 'classnames';
import styles from './ArrowGridData.module.css';

export const defaultLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

const defaultInitVal = 'x';

const identity = (x) => x;

export default function EquationData({
    initVal = defaultInitVal,
    equationLabelAtom,
    equationLabelString = 'default label string',
    inputSize = 20
}) {
    const encode = identity;
    const decode = (objStr) => {
        if (!objStr || !objStr.length || objStr.length === 0) return initVal;

        return objStr;
    };

    const equationStrAtom = atomWithReset(initVal);

    const labelAtom = equationLabelAtom ? equationLabelAtom : atom(equationLabelString);

    const comp = React.memo(() => {
        const [eqStr, setEqStr] = useAtom(equationStrAtom);
        const [equationLabel] = useAtom(labelAtom);

        const eqInputCB = useCallback((str) => setEqStr(str), [setEqStr]);

        return (
            <>
                {equationLabel} <Input size={inputSize} initValue={eqStr} onC={eqInputCB} />
            </>
        );
    });

    return {
        atom: equationStrAtom,
        component: comp,
        encode,
        decode
    };
}
