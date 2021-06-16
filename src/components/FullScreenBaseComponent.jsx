import React, { useRef } from 'react';

// height is assumed to be number, giving percentage of screen appBar will take (at the top)

export default function FullScreenBaseComponent({ children, backgroundColor, fonts }) {
    const css1 = useRef(
        {
            // external layout
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            border: 0,
            borderRadius: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            // internal layout
            padding: 0,
            backgroundColor: backgroundColor,
            overflow: 'auto',
            fontFamily: fonts
        },
        []
    );

    return <div style={css1.current}>{children}</div>;
}
