import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';
import { diffObjects, round, isEmpty } from '../utils/BaseUtils.ts';

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

    const ptAtom = atom(initValue);

    const serializeAtom = atom(null, (get, set, action) => {
        if (action.type === 'serialize') {
            const { x, y } = diffObjects(get(ptAtom), initValue);

            let ro = {};

            if (x) ro.x = x;
            if (y) ro.y = y;

            if (isEmpty(ro)) return;

            action.callback(ro);
        } else if (action.type === 'deserialize') {
            const objStr = action.value;

            if (!objStr || !objStr.length || objStr.length === 0) {
                set(ptAtom, initValue);
                return;
            }

            //console.log('deserialize of point occured with action.value = ', action.value);

            const rawObj = queryString.parse(objStr);

            const newKeys = Object.keys(rawObj);

            const ro = {};

            if (newKeys.includes('x')) ro.x = Number(rawObj.x);
            if (newKeys.includes('y')) ro.y = Number(rawObj.y);

            set(ptAtom, { ...defaultInitValues, ...ro });
        }
    });

    const component = React.memo(() => {
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

    ptAtom.component = component;
    ptAtom.serializeAtom = serializeAtom;

    return ptAtom;
}
