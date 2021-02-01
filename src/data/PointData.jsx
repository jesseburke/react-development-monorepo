import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';
import { diffObjects, round } from '../utils/BaseUtils.ts';

export const defaultLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
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

    const comp = React.memo(() => {
        const [point, setPoint] = useAtom(ptAtom);

        const setX = useCallback((newX) => setPoint((old) => ({ ...old, x: Number(newX) })), [
            setPoint
        ]);
        const setY = useCallback((newY) => setPoint((old) => ({ ...old, y: Number(newY) })), [
            setPoint
        ]);

        return (
            <div className='p-2'>
                <div>{inputStr}</div>
                <Input initValue={round(point.x, 3)} size={4} onC={setX} />
                <span> , </span>
                <Input initValue={round(point.y, 3)} size={4} onC={setY} />
            </div>
        );
    });

    return {
        atom: ptAtom,
        component: comp,
        encode,
        decode
    };
}
