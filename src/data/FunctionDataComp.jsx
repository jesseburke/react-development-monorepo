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

const defaultLabelAtom = atom({ x: 'x', y: 'y' });

const identity = (x) => x;

export default function FunctionDataComp({
    initVal = defaultInitVal,
    functionLabelAtom,
    functionLabelString = 'default label string',
    inputSize = 15,
    labelAtom = defaultLabelAtom
}) {
    const newFunctionLabelAtom = functionLabelAtom ? functionLabelAtom : atom(functionLabelString);

    const functionStrAtom = atom(initVal);

    const functionAtom = atom((get) => {
        const { x, y } = get(labelAtom);

        return { func: funcParser(get(functionStrAtom), x, y) };
    });

    const readWriteAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                set(functionStrAtom, initVal);
                break;

            case 'readToAddressBar':
                action.callback(get(functionStrAtom));
                break;

            case 'writeFromAddressBar':
                const funStr = action.value;

                if (!funStr || !funStr.length || funStr.length === 0) {
                    set(functionStrAtom, initVal);
                    return;
                }

                set(functionStrAtom, funStr);
                break;
        }
    });

    const component = React.memo(() => {
        const [eqStr, setEqStr] = useAtom(functionStrAtom);
        const [equationLabel] = useAtom(newFunctionLabelAtom);

        const eqInputCB = useCallback((str) => setEqStr(str), [setEqStr]);

        return (
            <div>
                <span className='pr-1'>{equationLabel}</span>
                <Input size={inputSize} initValue={eqStr} onC={eqInputCB} />
            </div>
        );
    });

    return { funcAtom: functionAtom, strAtom: functionStrAtom, readWriteAtom, component };
}
