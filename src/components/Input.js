import React from 'react';

import { jsx, css } from '@emotion/core';

export default function Input({onC, initValue, size, userCss={}}) {

      const newCss = Object.assign(
        {         
            fontSize: '.75em'
            
        }, userCss);

    const [intermediateValue, setIntermediateValue] = React.useState(initValue);

    const inputElt = React.useRef(null);


    function handleBlur(event) {
        if( onC ) {
            onC(event.target.value);
        }
    }

    function handleKey(event) {
       
        if (event.key === "Enter") {            
            inputElt.current.blur();            
        }
    }
          
    return (                 
              <input type="text"
                     onChange={e => setIntermediateValue(e.target.value)}
                     onBlur={handleBlur}
                     onKeyPress={handleKey}
                     size={size}
                     value={intermediateValue}
                     css={userCss}
                     ref={inputElt}
              />
    );
}
