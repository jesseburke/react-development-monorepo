import React, {useEffect, useRef, useState} from 'react';

import { jsx, css } from '@emotion/core';

function Input({onC, initValue, size, userCss={}}) {

      const newCss = Object.assign(
        {         
            fontSize: '.75em'
            
        }, userCss);

    const [intermediateValue, setIntermediateValue] = useState(initValue);

    const inputElt = useRef(null);

    useEffect( () => {

        setIntermediateValue( initValue );
    }, [initValue] );


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

export default React.memo( Input );
