import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';
import { diffObjects, isEmpty, round } from '../utils/BaseUtils';
import { OrthoCamera } from '../my-types';
import '../styles.css';

const defaultInitValues: OrthoCamera = {
    center: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
};

export default function OrthoCameraData(args: OrthoCamera = {}) {
    const initValue = { ...defaultInitValues, ...args };

    const cameraDataAtom = atom(initValue);

    const serializeAtom = atom(null, (get, set, action) => {
        if (action.type === 'serialize') {
            const { center, zoom, position } = diffObjects(get(cameraDataAtom), initValue);

            let ro: OrthoCamera = {};

            if (center) ro.c = queryString.stringify(center.map((x) => round(x, 2)));
            if (zoom) ro.z = zoom;
            if (position) ro.p = queryString.stringify(position.map((x) => round(x, 2)));

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

            const ro: OrthoCamera = {};

            if (newKeys.includes('c')) {
                const ct = queryString.parse(rawObj.c);

                ro.center = [Number(ct[0]), Number(ct[1]), Number(ct[2])];
            }
            if (newKeys.includes('z')) ro.zoom = Number(rawObj.z);
            if (newKeys.includes('p')) {
                const ps = queryString.parse(rawObj.p);

                ro.position = [Number(ps[0]), Number(ps[1]), Number(ps[2])];
            }

            set(cameraDataAtom, { ...initValue, ...ro });
        }
    });

    const component = React.memo(function OrthoCameraOptionsInput({}) {
        const [cameraData, setData] = useAtom(cameraDataAtom);

        let { center, zoom, position } = cameraData;
        center = center.map((x) => round(x, 2));

        const zoomCB = useCallback(
            (inputStr) => setData((oldData) => ({ ...oldData, zoom: Number(inputStr) })),
            [setData]
        );

        const centerXCB = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    center: [Number(inputStr), oldData.center[1], oldData.center[2]]
                })),
            [setData]
        );

        const centerYCB = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    center: [oldData.center[0], Number(inputStr), oldData.center[2]]
                })),
            [setData]
        );

        const centerZCB = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    center: [oldData.center[0], oldData.center[1], Number(inputStr)]
                })),
            [setData]
        );

        const positionXCB = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    position: [Number(inputStr), oldData.center[1], oldData.center[2]]
                })),
            [setData]
        );

        const positionYCB = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    position: [oldData.center[0], Number(inputStr), oldData.center[2]]
                })),
            [setData]
        );

        const positionZCB = useCallback(
            (inputStr) =>
                setData((oldData) => ({
                    ...oldData,
                    position: [oldData.center[0], oldData.center[1], Number(inputStr)]
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
                    <Input initValue={center[0]} size={4} onC={centerXCB} />
                    <span> , </span>
                    <Input initValue={center[1]} size={4} onC={centerYCB} />
                    <span> , </span>
                    <Input initValue={center[2]} size={4} onC={centerZCB} />
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
            </div>
        );
    });

    cameraDataAtom.component = component;
    cameraDataAtom.serializeAtom = serializeAtom;

    return cameraDataAtom;
}
