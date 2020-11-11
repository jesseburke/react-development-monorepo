import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';
import { diffObjects } from '../utils/BaseUtils.jsx';

import classnames from 'classnames';
import styles from './ArrowGridData.module.css';

export const defaultLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

const defaultTickLabelStyle = Object.assign(Object.assign({}, defaultLabelStyle), {
    fontSize: '1em',
    color: '#e19662'
});

const defaultInitValues = {
    radius: 0.01,
    color: '#0A2C3C',
    showLabels: true,
    labelStyle: defaultLabelStyle,
    tickDistance: 1,
    tickRadiusMultiple: 10,
    tickLabelDistance: 2,
    tickLabelStyle: defaultTickLabelStyle
};

// diffObjects = return all the fields and
// values of the second object that do not occur in the first.

export default function Axes2DData(args) {
    const initValue = { ...defaultInitValues, ...args };

    const encode = (newObj) => {
        const { radius, color, tickLabelDistance } = diffObjects(newObj, defaultInitValues);

        let ro = {};

        if (radius) ro.r = radius;
        if (color) ro.c = color;
        if (tickLabelDistance) ro.tld = tickLabelDistance;

        return queryString.stringify(ro);
    };

    const decode = (objStr) => {
        if (!objStr || !objStr.length || objStr.length === 0) return initValue;

        const rawObj = queryString.parse(objStr);

        const newKeys = Object.keys(rawObj);

        const ro = {};

        if (newKeys.includes('r')) ro.radius = Number(rawObj.r);
        if (newKeys.includes('tld')) ro.tickLabelDistance = Number(rawObj.tld);
        if (newKeys.includes('c')) ro.color = rawObj.c;

        return { ...initValue, ...ro };
    };

    const aoAtom = atom(initValue);

    const resetAtom = atom(null, (get, set) => {
        set(aoAtom, initValue);
    });

    const comp = React.memo(() => {
        const [ao, setAo] = useAtom(aoAtom);

        const { radius, color, tickLabelDistance } = ao;

        const radiusCB = useCallback(
            (inputStr) => setAo((oldAo) => ({ ...oldAo, radius: Number(inputStr) })),
            [setAo]
        );

        const tickLabelDistanceCB = useCallback(
            (inputStr) => setAo((oldAo) => ({ ...oldAo, tickLabelDistance: Number(inputStr) })),
            [setAo]
        );

        const colorCB = useCallback(
            (e) => setAo((oldAo) => ({ ...oldAo, color: e.target.value })),
            [setAo]
        );

        return (
            <div className={classnames(styles['center-flex-column'], styles['med-padding'])}>
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
                <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                    <span className={styles['text-align-center']}>Distance between labels:</span>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={tickLabelDistance} onC={tickLabelDistanceCB} />
                    </span>
                </div>
                <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                    <span className={styles['text-align-center']}>Width of axis:</span>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={radius} onC={radiusCB} />
                    </span>
                </div>
            </div>
        );
    });

    return {
        atom: aoAtom,
        resetAtom,
        component: comp,
        encode,
        decode
    };
}
