import React from 'react';

import {throttle} from '../utils/BaseUtils.js';

function Slider({value,
                 step = .1,
                 CB = () => null,
                 precision = 5,
                 sigDig = 1,
                 min = 0,
                 max = 10,
                 label='',
                 userCss={}}) {

    const cb = React.useCallback(
        (e) => {
            CB(e.target.value);
        }, []);

    return (<div style={userCss}>
            <input name="n" type="range" value={value} step={step}
	           onChange={cb}//(e) => CB(e.target.value)}
	           min={min} max={max}
            />
              <label  css={{padding: '0em .5em',
                            whiteSpace: 'nowrap'}}
                    htmlFor="range_n">{label + ' = ' + value.toPrecision(precision)}</label>
          </div>);
}

export default React.memo( Slider );


function round(x, n = 2) {

    // x = -2.336596841557143
    
    return Number(( x * Math.pow(10, n) )/Math.pow(10, n)).toFixed(n); 
    
}
