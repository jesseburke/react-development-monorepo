import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import { Input } from '@jesseburke/components';
import { diffObjects, isEmpty, round } from '@jesseburke/basic-utils';
import { OrthoCamera } from '../my-types';
import '../styles.css';

const defaultInitValues: OrthoCamera = {
    target: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
};

export default function OrthoCameraData(args: OrthoCamera = {}) {
    const initValue = { ...defaultInitValues, ...args };

    const cameraDataAtom = atom(initValue);

    const readWriteAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                set(cameraDataAtom, initValue);
                break;

            case 'readAndEncode':
                const { target, zoom, position } = diffObjects(get(cameraDataAtom), initValue);

                let ro = {};

                if (target) ro.t = queryString.stringify(target.map((x) => round(x, 2)));
                if (zoom) ro.z = zoom;
                if (position) ro.p = queryString.stringify(position.map((x) => round(x, 2)));

                if (isEmpty(ro)) return;

                action.callback(ro);
                break;

            case 'decodeAndWrite':
                const rawObj = action.value;

                const newKeys = Object.keys(rawObj);

                const nro: OrthoCamera = {};

                if (newKeys.includes('t')) {
                    const t = queryString.parse(rawObj.t);

                    nro.target = [Number(t[0]), Number(t[1]), Number(t[2])];
                }
                if (newKeys.includes('z')) nro.zoom = Number(rawObj.z);
                if (newKeys.includes('p')) {
                    const ps = queryString.parse(rawObj.p);

                    nro.position = [Number(ps[0]), Number(ps[1]), Number(ps[2])];
                }

                set(cameraDataAtom, { ...initValue, ...nro });
                break;
        }
    });

    const component = function OrthoCameraOptionsInput({}) {
        const [cameraData, setData] = useAtom(cameraDataAtom);

        let { target, zoom, position } = cameraData;
        target = target.map((x) => round(x, 2));

        const zoomCB = useCallback(
            (inputStr) => setData((oldData) => ({ ...oldData, zoom: Number(inputStr) })),
            [setData]
        );

        const targetXCB = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    target: [Number(inputStr), oldData.target[1], oldData.target[2]]
                })),
            [setData]
        );

        const targetYCB = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    target: [oldData.target[0], Number(inputStr), oldData.target[2]]
                })),
            [setData]
        );

        const targetZCB = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    target: [oldData.target[0], oldData.target[1], Number(inputStr)]
                })),
            [setData]
        );

        const straightenCB = useCallback(() => {
            let diffAndSquaredArray = position.map(
                (x, index) => (position[index] - target[index]) ** 2
            );

            const red = (acc, curVal) => acc + curVal;

            const l = Math.sqrt(diffAndSquaredArray.reduce(red));

            setData((oldData) => ({
                ...oldData,
                position: [oldData.target[0], oldData.target[1], l],
                target: [oldData.target[0], oldData.target[1], 0]
            }));
        }, [position, setData]);

        return (
            <div
                className='flex flex-col justify-center content-center
		items-center w-full h-full p-1'
            >
                <div className='py-2'>
                    <span className='text-center'>Camera target point: </span>
                    <Input initValue={target[0]} size={4} onC={targetXCB} />
                    <span> , </span>
                    <Input initValue={target[1]} size={4} onC={targetYCB} />
                    <span> , </span>
                    <Input initValue={target[2]} size={4} onC={targetZCB} />
                </div>
                <div className='py-2'>
                    <span className='text-center'>Zoom:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={zoom} onC={zoomCB} />
                    </span>
                </div>
                <div className='py-2'>
                    <span className='text-center'>Camera position: </span>

                    <span className='px-1'>{round(position[0], 2)},</span>
                    <span className='px-1'>{round(position[1], 2)},</span>
                    <span className='px-1'>{round(position[2], 2)}</span>
                </div>
                <div
                    className='p-2 rounded-md border-4 border-persian_blue-600'
                    onClick={straightenCB}
                >
                    <button className='focus:outline-none'>Straighten Camera</button>
                </div>
            </div>
        );
    };

    return { atom: cameraDataAtom, readWriteAtom, component };
}
