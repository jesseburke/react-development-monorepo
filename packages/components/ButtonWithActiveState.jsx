// see https://stackoverflow.com/questions/17481660/darken-background-image-on-hover
// for ideas on how to change hover behavior

import React, { useRef, useEffect, useState, memo } from 'react';
import { atom, useAtom } from 'jotai';

// should:
// - gray out the button, or some other visual effect, when not active
// - maybe component should be renamed to ButtonWithActiveState? (to
//   emphasize it's difference from a regular html button)

const defaultNotActiveAtom = atom(false);

export default memo(function Button({
    children,
    onClick = () => null,
    fontSize = '1em',
    margin = 0,
    borderRadius = '.35em',
    activeAtom,
    notActiveAtom = defaultNotActiveAtom,
    className
}) {
    const active = activeAtom ? useAtom(activeAtom)[0] : !useAtom(notActiveAtom)[0];

    //console.log('button called with children and active = ', children, active);

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
            cursor: 'not-allowed'
        },
        baseCss
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
