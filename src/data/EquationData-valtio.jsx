import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

import { proxy, useProxy } from 'valtio';

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

const defaultInitVal = { str: 'x' };

const identity = (x) => x;

export default function EquationData({
    initVal = defaultInitVal,
    equationLabelAtom = null,
    equationLabelString = 'default label string',
    inputSize = 20
}) {
    const encode = identity;
    const decode = (objStr) => {
        if (!objStr || !objStr.length || objStr.length === 0) return initVal;

        return objStr;
    };

    const equationStrProxy = proxy(initVal);

    const reset = () => (equationStrProxy.str = initVal.str);

    const dispatch = (newStr) => (equationStrProxy.str = newStr);

    const labelAtom = equationLabelAtom ? equationLabelAtom : atom(equationLabelString);

    const comp = React.memo(() => {
        const equationStr = useProxy(equationStrProxy);
        const [equationLabel] = useAtom(labelAtom);

        const eqInputCB = useCallback((str) => (equationStrProxy.str = str), []);

        return (
            <>
                {equationLabel}{' '}
                <Input size={inputSize} initValue={equationStr.str} onC={eqInputCB} />
            </>
        );
    });

    return {
        proxy: equationStrProxy,
        reset,
        component: comp,
        encode,
        dispatch
    };
}
