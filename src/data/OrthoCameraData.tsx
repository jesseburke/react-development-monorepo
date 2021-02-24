import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';
import { diffObjects, isEmpty, round } from '../utils/BaseUtils';
import { OrthoCameraData } from '../my-types';
import '../styles.css';

const defaultInitValues: OrthoCameraData = {
    center: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
};

export default function OrthoCameraData(args: OrthoCameraData = {}) {
    const initValue = { ...defaultInitValues, ...args };

    const cameraDataAtom = atom(initValue);
    const displayDataAtom = atom(initValue);
    const writerAtom = atom(null, (get, set, update) => {
        const oldVal = get(displayDataAtom);
        const newVal = { ...oldVal, ...update };

        set(cameraDataAtom, newVal);
        set(displayDataAtom, newVal);
    });

    const externalAtom = atom(
        (get) => get(cameraDataAtom),
        (get, set, newVal) => set(displayDataAtom, newVal)
    );

    const serializeAtom = atom(null, (get, set, action) => {
        if (action.type === 'serialize') {
            const { center, zoom, position } = diffObjects(get(displayDataAtom), initValue);

            let ro: OrthoCameraData = {};

            if (center) ro.c = queryString.stringify(center);
            if (zoom) ro.z = zoom;
            if (position) ro.p = queryString.stringify(position);

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

            if (newKeys.includes('c'))
                ro.center = [
                    Number(queryString.parse(rawObj.c)[0]),
                    Number(queryString.parse(rawObj.c)[1]),
                    Number(queryString.parse(rawObj.c)[2])
                ];
            if (newKeys.includes('z')) ro.zoom = Number(rawObj.z);
            if (newKeys.includes('p')) ro.position = queryString.parse(rawObj.p);

            set(cameraDataAtom, { ...initValue, ...ro });
            set(displayDataAtom, { ...initValue, ...ro });
        }
    });

    const component = React.memo(function OrthoCameraOptionsInput({}) {
        const { center, zoom, position } = useAtom(displayDataAtom)[0];
        const setData = useAtom(writerAtom)[1];

        const centerXCB = useCallback(
            (inputStr) => setData({ center: [Number(inputStr), center[1], center[2]] }),
            [setData, center]
        );

        const centerYCB = useCallback(
            (inputStr) => setData({ center: [center[0], Number(inputStr), center[2]] }),
            [setData, center]
        );

        const centerZCB = useCallback(
            (inputStr) => setData({ center: [center[0], center[1], Number(inputStr)] }),
            [setData, center]
        );

        const zoomCB = useCallback((inputStr) => setData({ zoom: Number(inputStr) }), [setData]);

        const positionXCB = useCallback(
            (inputStr) =>
                setData({
                    position: [Number(inputStr), position[1], position[2]]
                }),
            [setData, position]
        );

        const positionYCB = useCallback(
            (inputStr) =>
                setData({
                    position: [position[0], Number(inputStr), position[2]]
                }),
            [setData, position]
        );

        const positionZCB = useCallback(
            (inputStr) =>
                setData({
                    position: [position[0], position[1], Number(inputStr)]
                }),
            [setData, position]
        );

        return (
            <div
                className='flex flex-col justify-center content-center
		items-center w-full h-full p-1'
            >
                <div className='py-2'>
                    <span className='text-center'>View center point: </span>
                    <Input initValue={center[0]} size={2} onC={centerXCB} />
                    <span> , </span>
                    <Input initValue={center[1]} size={2} onC={centerYCB} />
                    <span> , </span>
                    <Input initValue={center[2]} size={2} onC={centerZCB} />
                </div>
                <div className='py-2'>
                    <span className='text-center'>Zoom:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={zoom} onC={zoomCB} />
                    </span>
                </div>
                <div className='py-2'>
                    <span className='text-center'>Camera position: </span>
                    <Input initValue={position[0]} size={2} onC={positionXCB} />
                    <span> , </span>
                    <Input initValue={position[1]} size={2} onC={positionYCB} />
                    <span> , </span>
                    <Input initValue={position[2]} size={2} onC={positionZCB} />
                </div>
            </div>
        );
    });

    externalAtom.component = component;
    externalAtom.serializeAtom = serializeAtom;

    return externalAtom;
}
