import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

import classnames from 'classnames';
import styles from './BoundsData.module.css';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';

import { diffObjects } from '../utils/BaseUtils.jsx';

const defaultLabelAtom = atom({ x: 'x', y: 'y' });

const defaultInitBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

export default function BoundsData({ labelAtom = defaultLabelAtom, initBounds = {} } = {}) {
    const encode = (newObj) => {
        const { xMin, xMax, yMin, yMax } = diffObjects(newObj, defaultInitBounds);

        let ro = {};

        if (xMax) ro.xp = xMax;
        if (xMin) ro.xm = xMin;
        if (yMax) ro.yp = yMax;
        if (yMin) ro.ym = yMin;

        return queryString.stringify(ro);
    };

    const decode = (objStr) => {
        if (!objStr || !objStr.length || objStr.length === 0)
            return { ...defaultInitBounds, ...initBounds };

        const rawObj = queryString.parse(objStr);

        const newKeys = Object.keys(rawObj);

        const ro = {};

        if (newKeys.includes('xm')) ro.xMin = Number(rawObj.xm);
        if (newKeys.includes('xp')) ro.xMax = Number(rawObj.xp);
        if (newKeys.includes('ym')) ro.yMin = Number(rawObj.ym);
        if (newKeys.includes('yp')) ro.yMax = Number(rawObj.yp);

        return { ...defaultInitBounds, ...ro };
    };

    const boundsAtom = atomWithReset({ ...defaultInitBounds, ...initBounds });

    const component = React.memo(function BoundsInput({}) {
        const [bounds, setBounds] = useAtom(boundsAtom);

        const { x: xLabel, y: yLabel } = useAtom(labelAtom)[0];

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

    return {
        atom: boundsAtom,
        component,
        encode,
        decode
    };
}
