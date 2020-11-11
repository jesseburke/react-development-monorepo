import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';
import { diffObjects, round } from '../utils/BaseUtils.jsx';

import classnames from 'classnames';
import styles from './ArrowGridData.module.css';

export const defaultLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

const defaultInitValues = {
    x: 0,
    y: 0
};

export default function PointData(initArgs, inputStr = 'Point: ') {
    const initValue = { ...defaultInitValues, ...initArgs };

    const encode = (newObj) => {
        const { x, y } = diffObjects(newObj, initValue);

        let ro = {};

        if (x) ro.x = x;
        if (y) ro.y = y;

        return queryString.stringify(ro);
    };

    const decode = (objStr) => {
        if (!objStr || !objStr.length || objStr.length === 0) return initValue;

        const rawObj = queryString.parse(objStr);

        const newKeys = Object.keys(rawObj);

        const ro = {};

        if (newKeys.includes('x')) ro.x = Number(rawObj.x);
        if (newKeys.includes('y')) ro.y = Number(rawObj.y);

        return { ...defaultInitValues, ...ro };
    };

    const ptAtom = atom(initValue);

    const resetAtom = atom(null, (get, set) => {
        set(ptAtom, initValue);
    });

    const comp = React.memo(() => {
        const [point, setPoint] = useAtom(ptAtom);

        const setX = useCallback((newX) => setPoint((old) => ({ ...old, x: Number(newX) })), [
            setPoint
        ]);
        const setY = useCallback((newY) => setPoint((old) => ({ ...old, y: Number(newY) })), [
            setPoint
        ]);

        const cssRef = useRef({ paddingRight: '5em' }, []);

        return (
            <div style={cssRef.current}>
                <span>
                    <span>{inputStr}</span>
                    <Input initValue={round(point.x, 3)} size={8} onC={setX} />
                    <span> , </span>
                    <Input initValue={round(point.y, 3)} size={8} onC={setY} />
                </span>
            </div>
        );
    });

    return {
        atom: ptAtom,
        component: comp,
        resetAtom,
        encode,
        decode
    };
}
