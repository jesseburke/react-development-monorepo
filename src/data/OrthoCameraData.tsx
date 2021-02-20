import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import { Checkbox } from 'reakit/Checkbox';

import Input from '../components/Input.jsx';
import { diffObjects, isEmpty } from '../utils/BaseUtils';
import { OrthoCameraData } from '../my-types';
import '../styles.css';

const defaultInitValues: OrthoCameraData = {
    center: [0, 0, 0],
    viewHeight: 10,
    rotationEnabled: false
};

export default function OrthoCameraData(args: OrthoCameraData = {}) {
    const initValue = { ...defaultInitValues, ...args };

    const cameraDataAtom = atom(initValue);

    const serializeAtom = atom(null, (get, set, action) => {
        if (action.type === 'serialize') {
            const { center, viewHeight, rotationEnabled } = diffObjects(
                get(cameraDataAtom),
                initValue
            );

            let ro: OrthoCameraData = {};

            if (center) ro.c = center;
            if (viewHeight) ro.v = viewHeight;
            if (rotationEnabled) ro.r = rotationEnabled ? 1 : 0;

            if (isEmpty(ro)) return;

            action.callback(ro);
        } else if (action.type === 'deserialize') {
            const objStr = action.value;

            if (!objStr || !objStr.length || objStr.length === 0) {
                set(cameraDataAtom, initValue);
                return;
            }

            const rawObj = queryString.parse(objStr);

            const newKeys = Object.keys(rawObj);

            const ro: OrthoCameraData = {};

            if (newKeys.includes('c')) ro.center = Number(rawObj.c);
            if (newKeys.includes('v')) ro.viewHeight = Number(rawObj.v);
            if (newKeys.includes('r')) ro.rotationEnabled = rawObj.r ? true : false;

            set(cameraDataAtom, { ...initValue, ...ro });
        }
    });

    const component = React.memo(function OrthoCameraOptionsInput({}) {
        const [data, setData] = useAtom(cameraDataAtom);

        const { center, viewHeight, rotationEnabled } = data;

        const rotationEnabledCB = useCallback(
            () => setData((oldData) => ({ ...oldData, rotationEnabled: !oldData.rotationEnabled })),
            [setData]
        );

        const viewHeightCB = useCallback(
            (inputStr) => setData((oldData) => ({ ...oldData, viewHeight: Number(inputStr) })),
            [setData]
        );

        const setCenterX = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    center: [Number(inputStr), oldData.center[1], oldData.center[2]]
                })),
            [setData]
        );

        const setCenterY = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    center: [oldData.center[0], Number(inputStr), oldData.center[2]]
                })),
            [setData]
        );

        return (
            <div
                className='flex flex-col justify-center content-center
		items-center w-full h-full p-1'
            >
                <div className='h-full py-2'>
                    <Checkbox checked={rotationEnabled} onChange={rotationEnabledCB} />
                    <span className='text-center'>Allow 3d camera movement</span>
                </div>
                <div className='py-2'>
                    <span className='text-center'>View center: </span>
                    <Input initValue={center[0]} size={2} onC={setCenterX} />
                    <span> , </span>
                    <Input initValue={center[1]} size={2} onC={setCenterY} />
                </div>
                <div className='py-2'>
                    <span className='text-center'>View height:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={viewHeight} onC={viewHeightCB} />
                    </span>
                </div>
            </div>
        );
    });

    cameraDataAtom.component = component;
    cameraDataAtom.serializeAtom = serializeAtom;

    return cameraDataAtom;
}
