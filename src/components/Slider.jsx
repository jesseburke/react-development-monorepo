import React from 'react';

import { throttle } from '../utils/BaseUtils.jsx';

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
    const cb = React.useCallback((e) => {
        CB(e.target.value);
    }, []);

    const css1 = React.useRef({ padding: '0em .5em', whiteSpace: 'nowrap' }, []);

    return (
        <div style={userCss}>
            <input
                name='n'
                type='range'
                value={value}
                step={step}
                onChange={cb} //(e) => CB(e.target.value)}
                min={min}
                max={max}
            />
            <br />
            <label style={css1.current} htmlFor='range_n'>
                {label + ' = ' + value.toPrecision(precision)}
            </label>
        </div>
    );
}

export default React.memo(Slider);

function round(x, n = 2) {
    // x = -2.336596841557143

    return Number((x * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n);
}
