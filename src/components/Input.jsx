import React, { useEffect, useRef, useState, useCallback } from 'react';

import styles from './Input.module.css';

export default React.memo(function Input({ onC, initValue, size }) {
    const inputElt = useRef(null);

    const handleBlur = useCallback(
        (event) => {
            if (onC) {
                onC(event.target.value);
            }
        },
        [onC]
    );

    const handleKey = useCallback((event) => {
        if (event.key === 'Enter') {
            inputElt.current.blur();
        } else if (event.key === 'Escape') {
            inputElt.current.value = initValue;
        }
    }, []);

    return (
        <input
            type='text'
            onBlur={handleBlur}
            onKeyDown={handleKey}
            size={size}
            defaultValue={initValue}
            className={styles.input}
            ref={inputElt}
        />
    );
});
