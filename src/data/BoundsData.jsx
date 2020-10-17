import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import classnames from 'classnames';
import styles from './BoundsData.module.css';

import Input from '../components/Input.jsx';

const defaultXLabelAtom = atom('x');
const defaultYLabelAtom = atom('y');

const defaultInitBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

function strArrayToArray(strArray, f = Number) {
    // e.g., '2,4,-32.13' -> [2, 4, -32.13]
    // f is a function applied to the string representing each array element

    return strArray.split(',').map((x) => f(x));
}

const encode = ({ xMin, xMax, yMin, yMax }) => ({ xm: xMin, xp: xMax, ym: yMin, yp: yMax });
const decode = ({ xm, xmx, ym, ymx }) => ({
    xMin: Number(xm),
    xMax: Number(xmx),
    yMin: Number(ym),
    yMax: Number(ymx)
});

export default function BoundsData({
    xLabelAtom = defaultXLabelAtom,
    yLabelAtom = defaultYLabelAtom,
    initBounds = {}
} = {}) {
    const boundsAtom = atom({ ...defaultInitBounds, ...initBounds });

    const component = React.memo(function BoundsInput({}) {
        const [bounds, setBounds] = useAtom(boundsAtom);

        const [xLabel] = useAtom(xLabelAtom);
        const [yLabel] = useAtom(yLabelAtom);

        const xMinCB = useCallback(
            (newxm) => setBounds((oldBounds) => ({ ...oldBounds, xMin: Number(newxm) })),
            [setBounds]
        );
        const xMaxCB = useCallback(
            (newxm) => setBounds((oldBounds) => ({ ...oldBounds, xMax: Number(newxm) })),
            [setBounds]
        );
        const yMinCB = useCallback(
            (newym) => setBounds((oldBounds) => ({ ...oldBounds, yMin: Number(newym) })),
            [setBounds]
        );
        const yMaxCB = useCallback(
            (newym) => setBounds((oldBounds) => ({ ...oldBounds, yMax: Number(newym) })),
            [setBounds]
        );

        return (
            <div className={styles['left-flex-column']}>
                <fieldset className={classnames(styles['full-width'], styles['center-flex-row'])}>
                    <legend>Direction field bounds</legend>

                    <div className={styles['center-flex-row']}>
                        <span className={styles['med-padding']}>
                            <Input size={4} initValue={bounds.xMin} onC={xMinCB} />
                        </span>
                        <span className={styles['text-align-center']}>
                            {' '}
                            {'\u2000 \u2264 \u2000' + xLabel + '\u2000 \u2264 \u2000'}
                        </span>
                        <span className={styles['med-padding']}>
                            <Input size={4} initValue={bounds.xMax} onC={xMaxCB} />
                        </span>
                    </div>

                    <div className={styles['center-flex-row']}>
                        <span className={styles['med-padding']}>
                            <Input size={4} initValue={bounds.yMin} onC={yMinCB} />
                        </span>
                        <span className={styles['text-align-center']}>
                            {' '}
                            {'\u2000 \u2264 \u2000' + yLabel + '\u2000 \u2264 \u2000'}
                        </span>
                        <span className={styles['med-padding']}>
                            <Input size={4} initValue={bounds.yMax} onC={yMaxCB} />
                        </span>
                    </div>
                </fieldset>
            </div>
        );
    });

    return { atom: boundsAtom, component, encode, decode, length: 4 };
}
