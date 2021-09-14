import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import { Input } from '@jesseburke/components';

import { diffObjects, isEmpty } from '@jesseburke/basic-utils';

import './styles.css';

export default function LabelData({ xLabel = 'x', yLabel = 'y', zLabel = 'z', twoD = 0 } = {}) {
    const initLabels = { x: xLabel, y: yLabel, z: zLabel };
    const labelAtom = atom(initLabels);

    const readWriteAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                set(labelAtom, initLabels);
                break;

            case 'readToAddressBar':
                const { x, y, z } = diffObjects(get(labelAtom), initLabels);

                let ro = {};

                if (x) {
                    ro.x = x;
                }
                if (y) {
                    ro.y = y;
                }
                if (z) {
                    ro.z = z;
                }

                if (isEmpty(ro)) {
                    return;
                }

                action.callback(ro);
                break;

            case 'writeFromAddressBar':
                const objStr = action.value;

                if (!objStr || !objStr.length || objStr.length === 0) {
                    set(labelAtom, initLabels);
                    return;
                }
                const rawObj = queryString.parse(objStr);

                const newKeys = Object.keys(rawObj);

                const nro = {};

                if (newKeys.includes('x')) nro.x = rawObj.x;
                if (newKeys.includes('y')) nro.y = rawObj.y;
                if (newKeys.includes('z')) nro.z = rawObj.z;

                set(labelAtom, { ...initLabels, ...nro });

                break;
        }
    });

    const component = function LabelInput({}) {
        const [{ x, y, z }, setLabels] = useAtom(labelAtom);

        const xCB = useCallback((inputStr) => setLabels((old) => ({ ...old, x: inputStr })), [
            setLabels
        ]);
        const yCB = useCallback((inputStr) => setLabels((old) => ({ ...old, y: inputStr })), [
            setLabels
        ]);
        const zCB = useCallback((inputStr) => setLabels((old) => ({ ...old, z: inputStr })), [
            setLabels
        ]);

        return (
            <div
                className='flex flex-col justify-center items-center
		h-full p-1'
            >
                <div
                    className='flex justify-center content-center
            items-center h-full p-1'
                >
                    <span className='text-center'>Dependent variable:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={z} onC={zCB} />
                    </span>
                </div>
                <div
                    className='flex justify-center
		    content-center items-center h-full p-1'
                >
                    <span className='text-center'>Independent variable 1:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={x} onC={xCB} />
                    </span>
                </div>
                <div
                    className='flex justify-center
		    content-center items-center h-full p-1'
                >
                    <span className='text-center'>Independent variable 2:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={y} onC={yCB} />
                    </span>
                </div>
            </div>
        );
    };

    const component2d = function LabelInput({}) {
        const [{ x, y, z }, setLabels] = useAtom(labelAtom);

        const xCB = useCallback((inputStr) => setLabels((old) => ({ ...old, x: inputStr })), [
            setLabels
        ]);
        const yCB = useCallback((inputStr) => setLabels((old) => ({ ...old, y: inputStr })), [
            setLabels
        ]);

        return (
            <div
                className='flex flex-col justify-center items-center
		h-full p-1'
            >
                <div
                    className='flex justify-center content-center
		    items-center h-full p-1'
                >
                    <span className='text-center'>Dependent variable: </span>
                    <span className='p-1'>
                        <Input size={4} initValue={y} onC={yCB} />
                    </span>
                </div>
                <div
                    className='flex justify-center
		    content-center items-center h-full p-1'
                >
                    <span className='text-center'>Independent variable: </span>
                    <span className='p-1'>
                        <Input size={4} initValue={x} onC={xCB} />
                    </span>
                </div>
            </div>
        );
    };

    return { atom: labelAtom, readWriteAtom, component: twoD ? component2d : component };
}
