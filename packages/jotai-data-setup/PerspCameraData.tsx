import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import { Input } from '@jesseburke/components';
import { diffObjects, isEmpty, round } from '@jesseburke/basic-utils';
import { PerspCamera } from '../my-types';
import './styles.css';

const defaultInitValues: PerspCamera = {
    target: [0, 0, 0],
    position: [0, 0, 50]
};

export default function PerspCameraData(args: PerspCamera = {}) {
    const initValue = { ...defaultInitValues, ...args };

    const cameraDataAtom = atom(initValue);

    const readWriteAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                set(cameraDataAtom, initValue);
                break;

            case 'readToAddressBar':
                const { target, position } = diffObjects(get(cameraDataAtom), initValue);

                let ro = {};

                if (target) ro.t = queryString.stringify(target.map((x) => round(x, 2)));
                if (position) ro.p = queryString.stringify(position.map((x) => round(x, 2)));

                if (isEmpty(ro)) return;

                action.callback(ro);
                break;

            case 'writeFromAddressBar':
                const objStr = action.value;

                if (!objStr || !objStr.length || objStr.length === 0) {
                    set(cameraDataAtom, initValue);
                    return;
                }

                const rawObj = queryString.parse(objStr);

                const newKeys = Object.keys(rawObj);

                const nro: OrthoCamera = {};

                if (newKeys.includes('t')) {
                    const t = queryString.parse(rawObj.t);

                    nro.target = [Number(t[0]), Number(t[1]), Number(t[2])];
                }
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

        let { target, position } = cameraData;
        target = target.map((x) => round(x, 2));

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

        return (
            <div
                className='flex flex-col justify-center content-center
		items-center w-full h-full p-1'
            >
                <div className='py-2'>
                    <span className='text-center'>View center point: </span>
                    <Input initValue={target[0]} size={4} onC={targetXCB} />
                    <span> , </span>
                    <Input initValue={target[1]} size={4} onC={targetYCB} />
                    <span> , </span>
                    <Input initValue={target[2]} size={4} onC={targetZCB} />
                </div>
                <div className='py-2'>
                    <span className='text-center'>Camera position: </span>

                    <span className='px-1'>{round(position[0], 2)},</span>
                    <span className='px-1'>{round(position[1], 2)},</span>
                    <span className='px-1'>{round(position[2], 2)}</span>
                </div>
            </div>
        );
    };

    return { atom: cameraDataAtom, readWriteAtom, component };
}
