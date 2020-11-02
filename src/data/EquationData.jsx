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

export default function EquationInput(
    initVal = defaultInitVal,
    xLabelAtom,
    yLabelAtom,
    inputSize = 20
) {
    const encode = identity;
    const decode = (objStr) => {
        if (!objStr || !objStr.length || objStr.length === 0) return initVal;

        return objStr;
    };

    const funcStrAtom = atomWithReset(initVal);

    const comp = React.memo(() => {
        const [funcStr, setFuncStr] = useAtom(funcStrAtom);
        const [xLabel] = useAtom(xLabelAtom);
        const [yLabel] = useAtom(yLabelAtom);

        const cssRef3 = useRef({ padding: '1em 0em' }, []);

        const funcInputCB = useCallback((str) => setFuncStr(str), [setFuncStr]);

        return (
            <div
                className={classnames(
                    styles['center-flex-column'],
                    styles['right-border'],
                    styles['large-right-padding'],
                    styles['med-top-bottom-padding']
                )}
            >
                <div style={cssRef3.current}>
                    d{yLabel}/d{xLabel} =
                    <Input size={inputSize} initValue={funcStr} onC={funcInputCB} />
                </div>
            </div>
        );
    });

    return {
        atom: funcStrAtom,
        component: comp,
        encode,
        decode
    };
}
