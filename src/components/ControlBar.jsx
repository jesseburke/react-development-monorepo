import React from 'react';

//import { jsx } from '@emotion/core';

// height is assumed to be number, giving percentage of screen appBar will take (at the top)

function controlBar({ children, height, fontSize, padding = '1em', userCss = {} }) {
    const b = (100 - height).toString() + '%';

    const cssRef = React.useRef(
        Object.assign(
            {
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
                justifyContent: 'space-around',
                alignItems: 'center',
                color: 'white',
                fontSize: fontSize.toString() + 'em',
                outlineOffset: 0,
                overflow: 'auto'
            },
            userCss
        ),
        []
    );

    return <header style={cssRef.current}>{children}</header>;
}

const ControlBar = React.memo(controlBar);

export default ControlBar;
