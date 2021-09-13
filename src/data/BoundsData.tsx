import React, { useState, useRef, useEffect, useCallback, memo } from 'react';

import { atom, useAtom, PrimitiveAtom } from 'jotai';

import queryString from 'query-string-esm';

import { Input } from '@jesseburke/components';

import { diffObjects, isEmpty } from '@jesseburke/basic-utils';
import { Bounds, BoundsMin, Label2 } from '../my-types';

const defaultLabelAtom: PrimitiveAtom<Label2> = atom({ x: 'x', y: 'y' });

const defaultInitBounds: Bounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20, zMin: -20, zMax: 20 };

export interface BoundsDataProps {
    labelAtom?: PrimitiveAtom<Label2>;
    initBounds?: Bounds;
}

export default function BoundsData({
    labelAtom = defaultLabelAtom,
    initBounds = defaultInitBounds,
    twoD = false
}: BoundsDataProps = {}) {
    const boundsAtom = atom(initBounds);

    const readWriteAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                set(boundsAtom, initBounds);
                break;

            case 'readToAddressBar':
                const { xMin, xMax, yMin, yMax, zMin, zMax }: Bounds = diffObjects(
                    get(boundsAtom),
                    initBounds
                );

                let ro: BoundsMin = {};

                if (xMax) ro.xp = xMax;
                if (xMin) ro.xm = xMin;
                if (yMax) ro.yp = yMax;
                if (yMin) ro.ym = yMin;
                if (zMax) ro.zp = zMax;
                if (zMin) ro.zm = zMin;

                if (isEmpty(ro)) return;

                action.callback(ro);

                break;

            case 'writeFromAddressBar':
                const objStr = action.value;

                if (!objStr || !objStr.length || objStr.length === 0) {
                    set(boundsAtom, initBounds);
                    return;
                }

                const rawObj = queryString.parse(objStr);

                const newKeys = Object.keys(rawObj);

                const nro: Bounds = {};

                if (newKeys.includes('xm')) nro.xMin = Number(rawObj.xm);
                if (newKeys.includes('xp')) nro.xMax = Number(rawObj.xp);
                if (newKeys.includes('ym')) nro.yMin = Number(rawObj.ym);
                if (newKeys.includes('yp')) nro.yMax = Number(rawObj.yp);
                if (newKeys.includes('zm')) nro.zMin = Number(rawObj.zm);
                if (newKeys.includes('zp')) nro.zMax = Number(rawObj.zp);

                set(boundsAtom, { ...initBounds, ...nro });
                break;
        }
    });

    const component = memo(function BoundsInput({}) {
        const [bounds, setBounds] = useAtom(boundsAtom);

        const { x: xLabel, y: yLabel, z: zLabel } = useAtom(labelAtom)[0];

        const xMinCB = useCallback(
            (newx) => setBounds((oldBounds) => ({ ...oldBounds, xMin: Number(newx) })),
            [setBounds]
        );
        const xMaxCB = useCallback(
            (newx) => setBounds((oldBounds) => ({ ...oldBounds, xMax: Number(newx) })),
            [setBounds]
        );
        const yMinCB = useCallback(
            (newy) => setBounds((oldBounds) => ({ ...oldBounds, yMin: Number(newy) })),
            [setBounds]
        );
        const yMaxCB = useCallback(
            (newy) => setBounds((oldBounds) => ({ ...oldBounds, yMax: Number(newy) })),
            [setBounds]
        );
        const zMinCB = useCallback(
            (newz) => setBounds((oldBounds) => ({ ...oldBounds, zMin: Number(newz) })),
            [setBounds]
        );
        const zMaxCB = useCallback(
            (newz) => setBounds((oldBounds) => ({ ...oldBounds, zMax: Number(newz) })),
            [setBounds]
        );

        return (
            <fieldset
                className='w-full h-full flex flex-col flex-center justify-center
		items-center content-center'
            >
                <div className='py-2'>Direction field bounds</div>

                <div
                    className='flex justify-center items-center
                    content-center h-full py-2'
                >
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.xMin} onC={xMinCB} />
                    </span>
                    <span className='text-center'>
                        {' '}
                        {'\u2000 \u2264 \u2000' + xLabel + '\u2000 \u2264 \u2000'}
                    </span>
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.xMax} onC={xMaxCB} />
                    </span>
                </div>

                <div
                    className='flex justify-center items-center
                    content-center h-full py-2'
                >
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.yMin} onC={yMinCB} />
                    </span>
                    <span className='text-center'>
                        {' '}
                        {'\u2000 \u2264 \u2000' + yLabel + '\u2000 \u2264 \u2000'}
                    </span>
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.yMax} onC={yMaxCB} />
                    </span>
                </div>
                <div
                    className='flex justify-center items-center
                    content-center h-full py-2'
                >
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.zMin} onC={zMinCB} />
                    </span>
                    <span className='text-center'>
                        {' '}
                        {'\u2000 \u2264 \u2000' + zLabel + '\u2000 \u2264 \u2000'}
                    </span>
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.zMax} onC={zMaxCB} />
                    </span>
                </div>
            </fieldset>
        );
    });

    const component2d = memo(function BoundsInput({}) {
        const [bounds, setBounds] = useAtom(boundsAtom);

        const { x: xLabel, y: yLabel } = useAtom(labelAtom)[0];

        const xMinCB = useCallback(
            (newxm) => setBounds((oldBounds) => ({ ...oldBounds, xMin: Number(newxm) })),
            [setBounds]
        );
        const xMaxCB = useCallback(
            (newxm) => setBounds((oldBounds) => ({ ...oldBounds, xMax: Number(newxm) })),
            [setBounds]
        );
        const yMinCB = useCallback(
            (newym) => setBounds((oldBounds) => ({ ...oldBounds, yMin: Number(newym) })),
            [setBounds]
        );
        const yMaxCB = useCallback(
            (newym) => setBounds((oldBounds) => ({ ...oldBounds, yMax: Number(newym) })),
            [setBounds]
        );

        return (
            <fieldset
                className='w-full h-full flex flex-col flex-center justify-center
		    items-center content-center'
            >
                <div className='py-2'>Direction field bounds</div>

                <div
                    className='flex justify-center items-center
                        content-center h-full py-2'
                >
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.xMin} onC={xMinCB} />
                    </span>
                    <span className='text-center'>
                        {' '}
                        {'\u2000 \u2264 \u2000' + xLabel + '\u2000 \u2264 \u2000'}
                    </span>
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.xMax} onC={xMaxCB} />
                    </span>
                </div>

                <div
                    className='flex justify-center items-center
                        content-center h-full py-2'
                >
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.yMin} onC={yMinCB} />
                    </span>
                    <span className='text-center'>
                        {' '}
                        {'\u2000 \u2264 \u2000' + yLabel + '\u2000 \u2264 \u2000'}
                    </span>
                    <span className='p-1'>
                        <Input size={4} initValue={bounds.yMax} onC={yMaxCB} />
                    </span>
                </div>
            </fieldset>
        );
    });

    return { atom: boundsAtom, readWriteAtom, component: twoD ? component2d : component };
}
