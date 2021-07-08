// see https://stackoverflow.com/questions/17481660/darken-background-image-on-hover
// for ideas on how to change hover behavior

import React, { useRef, useEffect, useState, memo } from 'react';

// should:
// - gray out the button, or some other visual effect, when not active
// - maybe component should be renamed to ButtonWithActiveState? (to
//   emphasize it's difference from a regular html button)

export default memo(function Button({
    children,
    onClick = () => null,
    fontSize = '1em',
    margin = 0,
    borderRadius = '.35em',
    active = true,
    className
}) {
    const baseCss = {
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
    };

    const abledCss = Object.assign(
        {
            cursor: 'pointer'
        },
        baseCss
    );

    const disabledCss = Object.assign(
        {
            cursor: 'not-allowed',
            display: 'none'
        },
        baseCss.current
    );

    if (!active) {
        return <button style={disabledCss}>{children}</button>;
    }

    return (
        <button style={abledCss} onClick={onClick} className={className ? className : null}>
            {children}
        </button>
    );
});
