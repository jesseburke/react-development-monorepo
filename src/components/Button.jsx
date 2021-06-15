// see https://stackoverflow.com/questions/17481660/darken-background-image-on-hover
// for ideas on how to change hover behavior

import React, { useRef, useEffect, useState } from 'react';

export default memo(function Button({
    children,
    onClickFunc = () => null,
    fontSize = '1em',
    margin = 0,
    borderRadius = '.35em',
    active = true,
    userCss = {}
}) {
    const baseCss = useRef(
        Object.assign(
            {
                paddingLeft: '1em',
                paddingRight: '1em',
                paddingTop: '.25em',
                paddingBottom: '.25em',
                border: '2px',
                borderStyle: 'solid',
                borderRadius: borderRadius,
                fontSize: fontSize.toString() + 'em',
                margin: margin,
                width: '10em',
                textAlign: 'center',
                userSelect: 'none'
            },
            userCss
        )
    );

    const abledCss = useRef(
        Object.assign(
            {
                cursor: 'pointer'
            },
            baseCss.current
        )
    );

    const disabledCss = useRef(
        Object.assign(
            {
                cursor: 'not-allowed'
            },
            baseCss.current
        )
    );

    if (!active) {
        return <span style={disabledCss.current}>{children}</span>;
    }

    return (
        <span style={abledCss.current} onClick={onClickFunc}>
            {children}
        </span>
    );
});
