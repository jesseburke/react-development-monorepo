import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import { Checkbox } from 'reakit/Checkbox';

import classnames from 'classnames';
import styles from './CurveData.module.css';

import Input from '../components/Input.jsx';

const defaultInitData = {
    color: '#C2374F',
    approxH: 0.1,
    visible: true
};

const encode = ({ color, approxH, visible }) => [color, approxH, Number(visible)];
const decode = ([c, a, v]) => ({ color: c, approxH: Number(a), visible: v === 0 ? false : true });

//console.log(decode(encode(defaultInitData)));

export default function CurveData(initData = {}) {
    const curveDataAtom = atom({ ...defaultInitData, ...initData });

    const toggleVisibleAtom = atom(null, (get, set) =>
        set(curveDataAtom, { ...get(curveDataAtom), visible: !get(curveDataAtom).visible })
    );

    const component = React.memo(function CurveOptionsInput({}) {
        const [data, setData] = useAtom(curveDataAtom);

        const toggleVisible = useAtom(toggleVisibleAtom)[1];

        const { color, approxH, visible } = data;

        //const [, toggle] = useAtom(svSelector);

        return (
            <label>
                <Checkbox checked={visible} onChange={toggleVisible} />
                <span className={styles['med-margin']}>Show solution curve</span>
            </label>
        );
    });

    return { component, atom: curveDataAtom, encode, decode, length: 3 };
}
