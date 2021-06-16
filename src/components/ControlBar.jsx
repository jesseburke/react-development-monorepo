import React, { useRef } from 'react';

export default function ControlBar({ children, height, fontSize, backgroundColor }) {
    const cssRef = useRef(
        Object.assign(
            {
                // external layout
                width: '100%',
                margin: 0,
                border: 0,
                borderRadius: 0,
                // internal layout
                padding: '3em',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                color: 'white',
                backgroundColor,
                fontSize: fontSize.toString() + 'em',
                outlineOffset: 0,
                overflow: 'auto'
            },
            {}
        ),
        []
    );

    return <header style={cssRef.current}>{children}</header>;
}
