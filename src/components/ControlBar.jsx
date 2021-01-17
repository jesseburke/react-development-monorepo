import React from 'react';

export default React.memo(function controlBar({ children, height, fontSize, backgroundColor }) {
    const cssRef = React.useRef(
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
});

//const ControlBar = React.memo(controlBar);

//export default ControlBar;

//...make this a tailwind component? can we customize those further?
