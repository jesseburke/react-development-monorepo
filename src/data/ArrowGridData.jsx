import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import Input from '../components/Input.jsx';

import classnames from 'classnames';
import styles from './ArrowGridData.module.css';

const defaultInitValues = {
    density: 1,
    thickness: 1,
    length: 0.75,
    color: '#C2374F'
};

function strArrayToArray(strArray, f = Number) {
    // e.g., '2,4,-32.13' -> [2, 4, -32.13]
    // f is a function applied to the string representing each array element

    return strArray.split(',').map((x) => f(x));
}

const encode = ({ density, thickness, length, color }) => ({
    d: density,
    t: thickness,
    l: length,
    c: color
});

const decode = ({ d, t, l, c }) => {
    return { density: Number(d), thickness: Number(t), length: Number(l), color: c };
};

//console.log(decode(encode(defaultInitValues)));

export default function ArrowGridData(args) {
    const agAtom = atom({ ...defaultInitValues, ...args });
    const stringRepAtom = atom((get) => {
        const { density, thickness, length, color } = get(agAtom);
        return JSON.stringify({
            d: density,
            t: thickness,
            l: length,
            c: color
        });
    });

    function ArrowGridOptionsInput() {
        const [agda, setAgda] = useAtom(agAtom);

        const { density, thickness, length, color } = agda;

        const densityCB = useCallback(
            (inputStr) => setAgda((oldAgda) => ({ ...oldAgda, density: Number(inputStr) })),
            [setAgda]
        );

        const lengthCB = useCallback(
            (inputStr) => setAgda((oldAgda) => ({ ...oldAgda, length: Number(inputStr) })),
            [setAgda]
        );

        const thicknessCB = useCallback(
            (inputStr) => setAgda((oldAgda) => ({ ...oldAgda, thickness: Number(inputStr) })),
            [setAgda]
        );

        const colorCB = useCallback(
            (e) => setAgda((oldAgda) => ({ ...oldAgda, color: e.target.value })),
            [setAgda]
        );

        return (
            <div className={classnames(styles['center-flex-column'], styles['med-padding'])}>
                <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                    <span className={styles['text-align-center']}>Arrows per unit:</span>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={density} onC={densityCB} />
                    </span>
                </div>

                <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                    <span className={styles['text-align-center']}>Relative arrow length:</span>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={length} onC={lengthCB} />
                    </span>
                </div>

                <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                    <span className={styles['text-align-center']}>Arrow thickness:</span>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={thickness} onC={thicknessCB} />
                    </span>
                </div>

                <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                    <span className={styles['text-align-center']}>Color:</span>
                    <span className={styles['med-padding']}>
                        <input
                            type='color'
                            name='color'
                            id='color'
                            value={color}
                            onChange={colorCB}
                        />
                    </span>
                </div>
            </div>
        );
    }

    return {
        atom: agAtom,
        stringRepAtom,
        component: ArrowGridOptionsInput,
        encode,
        decode,
        length: 4
    };
}
