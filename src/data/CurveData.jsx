import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import { Checkbox } from 'reakit/Checkbox';

import classnames from 'classnames';
import styles from './CurveData.module.css';

import Input from '../components/Input.jsx';

const defaultInitData = {
    color: '#C2374F',
    approxH: 0.1,
    visible: true,
    width: 0.1
};

const l = Object.keys(defaultInitData).length;

const encode = ({ color, approxH, visible, width }) => ({
    c: color,
    a: approxH,
    v: Number(visible),
    w: width
});
const decode = ({ c, a, v, w }) => ({
    color: c,
    approxH: Number(a),
    visible: v === '0' ? false : true,
    width: w
});

//console.log(decode(encode(defaultInitData)));

export default function CurveData(initData = {}) {
    const cdAtom = atom({ ...defaultInitData, ...initData });
    const cdStringRepAtom = atom((get) => {
        const { color, approxH, visible, width } = get(cdAtom);
        JSON.stringify({ c: color, a: approxH, v: visible, w: width });
    });

    const toggleVisibleAtom = atom(null, (get, set) =>
        set(cdAtom, { ...get(cdAtom), visible: !get(cdAtom).visible })
    );

    const component = React.memo(function CurveOptionsInput({}) {
        const [data, setData] = useAtom(cdAtom);

        const toggleVisible = useAtom(toggleVisibleAtom)[1];

        const { color, approxH, visible, width } = data;

        const colorCB = useCallback(
            (e) => setData((oldData) => ({ ...oldData, color: e.target.value })),
            [setData]
        );

        const widthCB = useCallback(
            (inputStr) => setData((oldData) => ({ ...oldData, width: Number(inputStr) })),
            [setData]
        );

        const approxCB = useCallback(
            (inputStr) => setData((oldData) => ({ ...oldData, approxH: Number(inputStr) })),
            [setData]
        );

        return (
            <div>
                <label>
                    <Checkbox checked={visible} onChange={toggleVisible} />
                    <span className={styles['med-margin']}>Show solution curve</span>
                </label>
                <div className={classnames(styles['center-flex-column'], styles['med-padding'])}>
                    <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                        <span className={styles['text-align-center']}>Curve color:</span>
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
                    <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                        <span className={styles['text-align-center']}>Curve width:</span>
                        <span className={styles['med-padding']}>
                            <Input size={4} initValue={width} onC={widthCB} />
                        </span>
                    </div>

                    <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                        <span className={styles['text-align-center']}>
                            Approximation constant (lower is better quality, but slower):
                        </span>
                        <span className={styles['med-padding']}>
                            <Input size={4} initValue={approxH} onC={approxCB} />
                        </span>
                    </div>
                </div>
            </div>
        );
    });

    return { component, atom: cdAtom, stringRepAtom: cdStringRepAtom, encode, decode, length: l };
}
