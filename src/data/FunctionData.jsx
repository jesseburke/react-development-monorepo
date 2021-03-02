import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import Input from '../components/Input.jsx';
import funcParser from '../utils/funcParser.jsx';
import { isEmpty } from '../utils/BaseUtils';

import '../styles.css';

export const defaultLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    fontSize: '1.5em'
};

const defaultInitVal = 'x';

const identity = (x) => x;

export default function FunctionData({
    initVal = defaultInitVal,
    functionLabelAtom,
    functionLabelString = 'default label string',
    inputSize = 15
}) {
    const functionStrAtom = atom(initVal);

    const functionAtom = atom((get) => ({
        func: funcParser(get(functionStrAtom))
    }));

    const labelAtom = functionLabelAtom ? functionLabelAtom : atom(functionLabelString);

    const serializeAtom = atom(null, (get, set, action) => {
        if (action.type === 'serialize') {
            action.callback(get(functionStrAtom));
        } else if (action.type === 'deserialize') {
            const funStr = action.value;

            if (!funStr || !funStr.length || funStr.length === 0) {
                set(functionStrAtom, initVal);
                return;
            }

            set(functionStrAtom, funStr);
        }
    });

    const component = React.memo(() => {
        const [eqStr, setEqStr] = useAtom(functionStrAtom);
        const [equationLabel] = useAtom(labelAtom);

        const eqInputCB = useCallback((str) => setEqStr(str), [setEqStr]);

        return (
            <div>
                <span className='pr-1'>{equationLabel}</span>
                <Input size={inputSize} initValue={eqStr} onC={eqInputCB} />
            </div>
        );
    });

    functionAtom.component = component;
    functionAtom.serializeAtom = serializeAtom;
    functionAtom.functionStrAtom = functionStrAtom;
    functionAtom.functionStrAtom.serializeAtom = serializeAtom;

    return functionAtom;
}
