import React from 'react';

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

    const css1 = React.useRef({ whiteSpace: 'nowrap' }, []);

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
                <span> {label + ' = '}</span>{' '}
                <input type='text' onChange={cb} value={value} size={4} />
            </label>
        </div>
    );
}

export default React.memo(Slider);
