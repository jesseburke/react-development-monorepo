import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import Input from '../components/Input.jsx';

import classnames from 'classnames';
import styles from './ArrowGridData.module.css';

export const defaultLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

export const defaultTickLabelStyle = Object.assign(defaultLabelStyle, {
    fontSize: '1em',
    color: '#DBBBB0'
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

const encode = ({ radius, color, tickLabelDistance }) => [radius, color, tickLabelDistance];

const decode = ([r, c, tld]) => {
    return { radius: Number(r), tickLabelDistance: Number(tld), color: c };
};

export default function Axes2DData(args) {
    const axesOptionsAtom = atom({ ...defaultInitValues, ...args });

    function Axes2DDataInput() {
        const [ao, setAo] = useAtom(axesOptionsAtom);

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
                    <span className={styles['text-align-center']}>Width of axis:</span>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={radius} onC={radiusCB} />
                    </span>
                </div>

                <div className={classnames(styles['center-flex-row'], styles['med-padding'])}>
                    <span className={styles['text-align-center']}>Distance between labels:</span>
                    <span className={styles['med-padding']}>
                        <Input size={4} initValue={tickLabelDistance} onC={tickLabelDistanceCB} />
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
        atom: axesOptionsAtom,
        component: Axes2DDataInput,
        encode,
        decode,
        length: 4
    };
}
