import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom, PrimitiveAtom } from 'jotai';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';

import { diffObjects, isEmpty } from '../utils/BaseUtils';
import { Bounds2, Bounds2Min, Label2 } from '../my-types';

const defaultLabelAtom: PrimitiveAtom<Label2> = atom({ x: 'x', y: 'y' });

const defaultInitBounds: Bounds2 = { xMin: -20, xMax: 20, yMin: -20, yMax: 20 };

export interface BoundsDataProps {
    labelAtom?: PrimitiveAtom<Label2>;
    initBounds?: Bounds2;
}

export default function BoundsData({
    labelAtom = defaultLabelAtom,
    initBounds = defaultInitBounds
}: BoundsDataProps = {}) {
    const boundsAtom = atom(initBounds);

    const serializeAtom = atom(null, (get, set, action) => {
        if (action.type === 'serialize') {
            const { xMin, xMax, yMin, yMax }: Bounds2 = diffObjects(get(boundsAtom), initBounds);

            let ro: Bounds2Min = {};

            if (xMax) ro.xp = xMax;
            if (xMin) ro.xm = xMin;
            if (yMax) ro.yp = yMax;
            if (yMin) ro.ym = yMin;

            if (isEmpty(ro)) return;

            action.callback(ro);
        } else if (action.type === 'deserialize') {
            const objStr = action.value;

            if (!objStr || !objStr.length || objStr.length === 0) {
                set(boundsAtom, initBounds);
                return;
            }

            const rawObj = queryString.parse(objStr);

            const newKeys = Object.keys(rawObj);

            const ro: Bounds2 = {};

            if (newKeys.includes('xm')) ro.xMin = Number(rawObj.xm);
            if (newKeys.includes('xp')) ro.xMax = Number(rawObj.xp);
            if (newKeys.includes('ym')) ro.yMin = Number(rawObj.ym);
            if (newKeys.includes('yp')) ro.yMax = Number(rawObj.yp);

            set(boundsAtom, { ...initBounds, ...ro });
        }
    });

    const component = React.memo(function BoundsInput({}) {
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

    boundsAtom.component = component;
    boundsAtom.serializeAtom = serializeAtom;

    return boundsAtom;
}
