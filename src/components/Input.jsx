import React, { useEffect, useRef, useState, useCallback } from 'react';

export default (function Input({ onC, initValue, size = 10 }) {
    const inputElt = useRef(null);

    const handleBlur = useCallback(
        (event) => {
            if (onC) {
                onC(event.target.value);
            }
        },
        [onC]
    );

    const handleKey = useCallback(
        (event) => {
            if (event.key === 'Enter') {
                inputElt.current.blur();
            } else if (event.key === 'Escape') {
                inputElt.current.value = initValue;
            }
        },
        [initValue]
    );

    // want this to run every time?
    // e.g., an input is normalized to always be 1 (e.g., the coeff in
    // eq of a line), but still need to change the input value,
    // because user may have changed it
    useEffect(() => {
        if (!inputElt.current) return;

        inputElt.current.value = initValue;
    });

    return (
        <input
            className='text-black px-1 rounded-sm border-2 border-gray-800'
            type='text'
            onBlur={handleBlur}
            onKeyDown={handleKey}
            size={size}
            defaultValue={initValue}
            ref={inputElt}
        />
    );
});
