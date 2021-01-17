import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import Input from '../components/Input.jsx';

import { diffObjects } from '../utils/BaseUtils.jsx';

import '../styles.css';

const defaultInitValues = {
    density: 1,
    thickness: 1,
    length: 0.75,
    color: '#C2374F'
};

function strArrayToArray(strArray, f = Number) {
    // e.g., '2,4,-32.13' -> [2, 4, -32.13]
    // f is a function applied to the string representing each array element

    return strArray.split(',').map((x) => f(x));
}

export default function ArrowGridData(args) {
    const initValue = { ...defaultInitValues, ...args };

    const encode = (newObj) => {
        const { density, thickness, length, color } = diffObjects(newObj, initValue);

        let ro = {};

        if (density) ro.d = density;
        if (thickness) ro.t = thickness;
        if (length) ro.l = length;
        if (color) ro.c = color;

        return queryString.stringify(ro);
        //queryString.stringify({ d: density, t: thickness, l: length, c: color });
    };

    const decode = (objStr) => {
        if (!objStr || !objStr.length || objStr.length === 0) return initValue;

        const rawObj = queryString.parse(objStr);

        const newKeys = Object.keys(rawObj);

        const ro = {};

        if (newKeys.includes('d')) ro.density = Number(rawObj.d);
        if (newKeys.includes('t')) ro.thickness = Number(rawObj.t);
        if (newKeys.includes('l')) ro.length = Number(rawObj.l);
        if (newKeys.includes('c')) ro.color = rawObj.c;

        return { ...initValue, ...ro };
    };

    //console.log(decode(encode(defaultInitValues)));

    const agAtom = atom(initValue);

    const resetAtom = atom(null, (get, set) => {
        set(agAtom, initValue);
    });

    const ArrowGridOptionsInput = React.memo(() => {
        const [agda, setAgda] = useAtom(agAtom);

        const { density, thickness, length, color } = agda;

        const densityCB = useCallback(
            (inputStr) => setAgda((oldAgda) => ({ ...oldAgda, density: Number(inputStr) })),
            [setAgda]
        );

        const lengthCB = useCallback(
            (inputStr) => setAgda((oldAgda) => ({ ...oldAgda, length: Number(inputStr) })),
            [setAgda]
        );

        const thicknessCB = useCallback(
            (inputStr) => setAgda((oldAgda) => ({ ...oldAgda, thickness: Number(inputStr) })),
            [setAgda]
        );

        const colorCB = useCallback(
            (e) => setAgda((oldAgda) => ({ ...oldAgda, color: e.target.value })),
            [setAgda]
        );

        return (
            <div
                className='flex flex-col justify-center
		items-center h-full'
            >
                <div
                    className='flex justify-center items-center
		    content-center h-full px-1'
                >
                    <span className='text-center'>Arrows per unit:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={density} onC={densityCB} />
                    </span>
                </div>

                <div
                    className='flex justify-center items-center
		    content-center h-full p-1'
                >
                    <span className='text-center'>Relative arrow length:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={length} onC={lengthCB} />
                    </span>
                </div>

                <div
                    className='flex justify-center items-center
		    content-center h-full p-1'
                >
                    <span className='text-center'>Arrow thickness:</span>
                    <span className='p-1'>
                        <Input size={4} initValue={thickness} onC={thicknessCB} />
                    </span>
                </div>

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
            </div>
        );
    });

    return {
        atom: agAtom,
        resetAtom,
        component: ArrowGridOptionsInput,
        encode,
        decode
    };
}
