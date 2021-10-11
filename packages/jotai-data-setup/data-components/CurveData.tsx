import React, { useState, useRef, useEffect, useCallback, memo } from 'react';

import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import * as Checkbox from '@radix-ui/react-checkbox';

import { Input } from '@jesseburke/components';
import { diffObjects, isEmpty } from '@jesseburke/basic-utils';
import { CurveData2, CurveData2Min } from '../my-types';
import '../styles.css';

const defaultInitValues: CurveData2 = {
    color: '#C2374F',
    approxH: 0.1,
    visible: true,
    width: 0.1
};

export default function CurveData(args: CurveData2 = {}) {
    const initValue = { ...defaultInitValues, ...args };

    const cdAtom = atom(initValue);

    const readWriteAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                set(cdAtom, initValue);
                break;

            case 'readAndEncode':
                const { color, approxH, visible, width } = diffObjects(get(cdAtom), initValue);

                let ro: CurveData2Min = {};

                if (color) ro.c = color;
                if (approxH) ro.a = approxH;
                if (visible) ro.v = visible;
                if (width) ro.w = width;

                if (isEmpty(ro)) return;

                action.callback(ro);
                break;

            case 'decodeAndWrite':
                const rawObj: CurveData2Min = action.value;

                const newKeys = Object.keys(rawObj);

                const nro: CurveData2 = {};

                if (newKeys.includes('a')) nro.approxH = Number(rawObj.a);
                if (newKeys.includes('v')) nro.visible = rawObj.v === 0 ? false : true;
                if (newKeys.includes('w')) nro.width = Number(rawObj.w);
                if (newKeys.includes('c')) nro.color = rawObj.c;

                set(cdAtom, { ...initValue, ...nro });
                break;
        }
    });

    const component = memo(function CurveOptionsInput({ offerToShow = true } = {}) {
        const [data, setData] = useAtom(cdAtom);

        const { color, approxH, visible, width } = data;

        const colorCB = useCallback(
            (e) => setData((oldData) => ({ ...oldData, color: e.target.value })),
            [setData]
        );

        const approxCB = useCallback(
            (inputStr) => setData((oldData) => ({ ...oldData, approxH: Number(inputStr) })),
            [setData]
        );

        const visibleCB = useCallback(
            () =>
                setData((oldData) => {
                    console.log(oldData);
                    return { ...oldData, visible: !oldData.visible };
                }),
            [setData]
        );

        const widthCB = useCallback(
            (inputStr) => setData((oldData) => ({ ...oldData, width: Number(inputStr) })),
            [setData]
        );

        return (
            <div
                className='flex flex-col justify-center
		items-center h-full p-1'
            >
                {offerToShow ? (
                    <div className='flex items-baseline'>
                        <input
                            type='checkbox'
                            id='showSC'
                            name='showSC'
                            value='show solution curve'
                            checked={visible}
                            onChange={visibleCB}
                            className='px-2'
                        />
                        <label htmlFor='showSC' className='px-2'>
                            Show solution curve
                        </label>
                    </div>
                ) : null}
                <div>
                    <div
                        className='flex justify-center items-center
			content-center h-full p-1'
                    >
                        <span className='text-center'>Curve color:</span>
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
			content-center h-full'
                    >
                        <span className='text-center'>Curve width:</span>
                        <span className='p-1'>
                            <Input size={4} initValue={width} onC={widthCB} />
                        </span>
                    </div>

                    <div
                        className='flex justify-center items-center
			content-center h-full'
                    >
                        <div className='text-center'>
                            <p>Approximation constant:</p>
                            <p>(lower is better quality, but slower)</p>
                        </div>
                        <span className='p-1'>
                            <Input size={4} initValue={approxH} onC={approxCB} />
                        </span>
                    </div>
                </div>
            </div>
        );
    });

    return { atom: cdAtom, readWriteAtom, component };
}
