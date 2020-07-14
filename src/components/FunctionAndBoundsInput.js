import React, { useState, useCallback, useRef } from 'react';

import { jsx } from '@emotion/core';

import Input from '../components/Input.js';
import Button from '../components/Button.js';

import funcParser, { funcParserXT } from '../utils/funcParser.js';

import styles from './FunctionAndBoundsInput.module.css';

export default React.memo(function FunctionAndBoundsInput({
    leftSideOfEquation,
    onChangeFunc,
    initFuncStr,
    totalWidth = '20em',
    inputSize = 25,
    userCss = {}
}) {
    //const [funcStr, setFuncStr] = React.useState(initFuncStr);

    function handleChange(str) {
        //console.log('functionInput.handleChange called with string value = ', str);

        if (str.length === 0) {
            onChangeFunc(null);
            return;
        }

        onChangeFunc(funcParser(str), str);
    }

    const css1 = useRef(
        Object.assign(
            {
                width: totalWidth,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
                //border: '2px', borderStyle: 'dashed'
            },
            userCss
        ),
        []
    );

    const css2 = useRef(
        {
            padding: '.5em'
        },
        []
    );

    return (
        <span style={css1.current}>
            <span className={styles['btn']}>{leftSideOfEquation}</span>
            <Input size={inputSize} initValue={initFuncStr} onC={handleChange} />
        </span>
    );
});

// bis = bound input size
const bis = 3;

export const FunctionAndBoundsInputXT = React.memo(function functionInputAndBoundsXT({
    leftSideOfEquation,
    onChangeFunc,
    initFuncStr,
    initBounds,
    inputSize = 35,
    userCss = {}
}) {
    const [bounds, setBounds] = useState(initBounds);
    const [funcStr, setFuncStr] = useState(initFuncStr);

    const funcCB = useCallback((newFuncStr) => setFuncStr(newFuncStr), []);
    const xMaxCB = useCallback(
        (newXMaxStr) => setBounds(({ xMax, ...rest }) => ({ xMax: Number(newXMaxStr), ...rest })),
        []
    );
    const tMaxCB = useCallback(
        (newTMaxStr) => setBounds(({ tMax, ...rest }) => ({ tMax: Number(newTMaxStr), ...rest })),
        []
    );

    const graphButtonCB = useCallback(() => onChangeFunc(bounds, funcStr), [bounds, funcStr]);

    return (
        <div className={styles['base']}>
            <div className={styles['outside-container base-item']}>
                <span className={styles['inside-container outside-container-item']} style={userCss}>
                    <span className={styles['left-side-equation']}>{leftSideOfEquation}</span>
                    <Input size={inputSize} initValue={initFuncStr} onC={funcCB} />
                </span>

                <span className={styles['inside-container outside-container-item']}>
                    <span className={styles['inside-container-item']}>
                        <span className={styles['text-item']}>{'0 \u{2264} x \u{2264}'}</span>
                        <Input size={bis} initValue={initBounds.xMax} onC={xMaxCB} />
                    </span>
                    <span className={styles['inside-container-item']}>
                        <span className={styles['text-item']}>{'0 \u{2264} t \u{2264}'}</span>
                        <Input size={bis} initValue={initBounds.tMax} onC={tMaxCB} />
                    </span>
                </span>
            </div>

            <button type={'button'} className={styles['base-item button']} onClick={graphButtonCB}>
                Graph
            </button>
        </div>
    );
});
