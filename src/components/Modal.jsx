import React, { useState, useRef, useEffect } from 'react';

function modal({
    children,
    show = false,
    topPerc = 25,
    leftPerc = 40,
    fontWidth = 1,
    color = '#FFFFFF',
    onClose
}) {
    const left = show ? leftPerc : 200;

    return (
        <div
            css={{
                position: 'fixed',
                top: topPerc.toString() + '%',
                left: left.toString() + '%',
                width: 'auto',
                fontWidth: fontWidth,
                backgroundColor: color,
                border: '1px',
                borderStyle: 'solid',
                borderRadius: '.5em'
            }}
        >
            <div
                css={{
                    position: 'absolute',
                    top: '0em',
                    right: '0.3em',
                    padding: '0.3em',
                    cursor: 'pointer',
                    fontSize: '2em',
                    height: '1em',
                    width: '1em'
                }}
                onClick={onClose}
            >
                {'\u{00D7}'}
            </div>
            {children}
        </div>
    );
}

const Modal = React.memo(modal);

export default Modal;
