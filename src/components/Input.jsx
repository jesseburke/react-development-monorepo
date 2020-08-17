import React, { useEffect, useRef, useState, useCallback } from 'react';

import styles from './Input.module.css';

export default React.memo(function Input({ onC, initValue, size = 10 }) {
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

    useEffect(() => {
        if (!inputElt.current) return;

        inputElt.current.value = initValue;
    }, [initValue]);

    return (
        <input
            type='text'
            onBlur={handleBlur}
            onKeyDown={handleKey}
            size={size}
            defaultValue={initValue}
            ref={inputElt}
        />
    );
});
