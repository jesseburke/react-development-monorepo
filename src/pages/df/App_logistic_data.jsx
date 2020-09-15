import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import Input from '../../components/Input.jsx';

import classnames from 'classnames';
import styles from './App_simple_sep.module.css';

const initArrowColor = '#C2374F';

export const arrowGridDisplayAtom = atom({
    density: 1,
    thickness: 1,
    length: 0.75,
    color: initArrowColor
});

export function ArrowGridOptions() {
    const [agda, setAgda] = useAtom(arrowGridDisplayAtom);

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
                    <input type='color' name='color' id='color' value={color} onChange={colorCB} />
                </span>
            </div>
        </div>
    );
}
