import React, { useRef, useCallback } from 'react';

export default function Slider({
    value,
    step = 0.1,
    CB = () => null,
    precision = 3,
    sigDig = 1,
    min = 0,
    max = 10,
    label = '',
    userCss = {}
}) {
    const cb = useCallback((e) => {
        CB(e.target.value);
    }, []);

    return (
        <div>
            <input
                name='n'
                type='range'
                value={value}
                step={step}
                onChange={cb}
                min={min}
                max={max}
                id='slider'
            />
            <label htmlFor='slider' className='block'>
                {label} = {value.toString()}
            </label>
        </div>
    );
}
