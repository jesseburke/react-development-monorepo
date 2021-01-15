import React from 'react';

// height is assumed to be number, giving percentage of screen appBar will take (at the top)

function main({ children, height, fontSize = 0.85 }) {
    const css1 = React.useRef(
        {
            // external layout
            //position: 'absolute',
            //top: (100 - height).toString() + '%',
            //left: 0,
            //right: 0,
            //bottom: 0,
            flexGrow: 1,
            position: 'relative',
            // internal layout
            padding: 0,
            backgroundColor: '#ffffff',
            //borderStyle: 'dashed'
            fontSize: fontSize.toString() + 'em'
        },
        []
    );

    return <main style={css1.current}>{children}</main>;
}

const Main = React.memo(main);

export default Main;
