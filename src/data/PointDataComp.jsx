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

export default function PointDataComp(initArgs, inputStr = 'Point: ') {
    const initValue = { ...defaultInitValues, ...initArgs };

    const ptAtom = atom(initValue);

    const readWriteAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                set(ptAtom, initValue);
                break;

            case 'readToAddressBar':
                const { x, y } = diffObjects(get(ptAtom), initValue);

                let ro = {};

                if (x) ro.x = x;
                if (y) ro.y = y;

                if (isEmpty(ro)) return;

                action.callback(ro);
                break;

            case 'writeFromAddressBar':
                const objStr = action.value;

                if (!objStr || !objStr.length || objStr.length === 0) {
                    set(ptAtom, initValue);
                    return;
                }

                //console.log('deserialize of point occured with action.value = ', action.value);

                const rawObj = queryString.parse(objStr);

                const newKeys = Object.keys(rawObj);

                const nro = {};

                if (newKeys.includes('x')) nro.x = Number(rawObj.x);
                if (newKeys.includes('y')) nro.y = Number(rawObj.y);

                set(ptAtom, { ...defaultInitValues, ...nro });
                break;
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
                <Input initValue={round(point.x, 3)} size={6} onC={setX} />
                <span> , </span>
                <Input initValue={round(point.y, 3)} size={6} onC={setY} />
            </div>
        );
    });

    return { atom: ptAtom, readWriteAtom, component };
}
