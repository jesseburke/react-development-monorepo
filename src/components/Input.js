import React, { useEffect, useRef, useState, useCallback } from 'react';

//import { jsx, css } from '@emotion/core';

export default React.memo(function Input({ onC, initValue, size, userCss = {} }) {
    const newCss = useRef(
        Object.assign(
            {
                fontSize: '.75em'
            },
            userCss
        )
    );

    const [intermediateValue, setIntermediateValue] = useState(initValue);

    const inputElt = useRef(null);

    useEffect(() => {
        setIntermediateValue(initValue);
    }, [initValue]);

    const handleBlur = useCallback(
        (event) => {
            if (onC) {
                onC(Number(event.target.value));
            }
        },
        [onC]
    );

    const handleKey = useCallback((event) => {
        if (event.key === 'Enter') {
            inputElt.current.blur();
        }
    }, []);

    const handleChange = useCallback(
        (event) => setIntermediateValue(Number(event.target.value)),
        []
    );

    return (
        <input
            type='text'
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKey}
            size={size}
            value={intermediateValue}
            style={newCss.current}
            ref={inputElt}
        />
    );
});
