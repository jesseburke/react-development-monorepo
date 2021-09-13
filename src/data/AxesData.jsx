import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithReset } from 'jotai/utils';

import queryString from 'query-string-esm';

import { Input } from '@jesseburke/components';
import { diffObjects, isEmpty } from '@jesseburke/basic-utils';

import './styles.css';

export const defaultLabelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
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

export default function AxesDataComp(args) {
    const initValue = { ...defaultInitValues, ...args };

    const aoAtom = atom(initValue);

    const readWriteAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                set(aoAtom, initValue);
                break;

            case 'readToAddressBar':
                const { radius, color, tickLabelDistance } = diffObjects(get(aoAtom), initValue);

                let ro = {};

                if (radius) ro.r = radius;
                if (color) ro.c = color;
                if (tickLabelDistance) ro.tld = tickLabelDistance;

                if (isEmpty(ro)) return;

                action.callback(ro);
                break;

            case 'writeFromAddressBar':
                const objStr = action.value;

                if (!objStr || !objStr.length || objStr.length === 0) {
                    set(aoAtom, initValue);
                    return;
                }

                const rawObj = queryString.parse(objStr);

                const newKeys = Object.keys(rawObj);

                const nro = {};

                if (newKeys.includes('r')) nro.radius = Number(rawObj.r);
                if (newKeys.includes('tld')) nro.tickLabelDistance = Number(rawObj.tld);
                if (newKeys.includes('c')) nro.color = rawObj.c;

                set(aoAtom, { ...initValue, ...nro });
                break;
        }
    });

    const component = () => {
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
            <div
                className='flex flex-col justify-center
		items-center h-full p-1'
            >
                <div
                    className='flex justify-center items-center
		    content-center h-full p-1'
                >
                    <span className='text-center'>Color:</span>
                    <span className='p-1'>
                        <input
                            type='color'
                            name='color'
                            id='color'
                            value={color}
                            onChange={colorCB}
                        />
                    </span>
                </div>
                <div
                    className='flex justify-center items-center
		    content-center h-full p-1'
                >
                    <span className='text-center'>Distance between labels:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={tickLabelDistance} onC={tickLabelDistanceCB} />
                    </span>
                </div>
                <div
                    className='flex justify-center items-center
		    content-center h-full p-1'
                >
                    <span className='text-center'>Width of axis:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={radius} onC={radiusCB} />
                    </span>
                </div>
            </div>
        );
    };

    return { atom: aoAtom, readWriteAtom, component };
}
