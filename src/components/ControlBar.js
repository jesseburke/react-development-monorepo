import React from 'react';

import { jsx } from '@emotion/core';

// height is assumed to be number, giving percentage of screen appBar will take (at the top)

function controlBar( {children, height, fontSize, padding='1em'} ) {
    const b = (100-height).toString()+'%';
    
    return (
        <header css={{
            // external layout
            position: 'absolute',
            //height: '100px',
            top: '0px',
            left: '0px',
            bottom: b,
            width: '100%',
            margin: 0,    
            border: 0,
            borderRadius: 0,
            // internal layout
            padding,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            fontSize: fontSize.toString()+'em',
            outlineOffset: 0,
            overflow: 'auto'
        }}>
          {children}
        </header>
    );    
}

const ControlBar = React.memo(controlBar);

export default ControlBar;
