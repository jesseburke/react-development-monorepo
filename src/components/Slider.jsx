import React, { useRef, useCallback } from 'react';

import Input from './Input.jsx';

function Slider({
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

    const inputCB = useCallback((str) => {
        CB(Number(str));
    }, []);

    const css1 = useRef({ whiteSpace: 'nowrap' }, []);

    return (
        <div style={userCss}>
            <input
                name='n'
                type='range'
                value={value}
                step={step}
                onChange={cb}
                min={min}
                max={max}
            />
        </div>
    );
}

export default React.memo(Slider);
