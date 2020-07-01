// see https://stackoverflow.com/questions/17481660/darken-background-image-on-hover
// for ideas on how to change hover behavior

import React from 'react';

export default function ResetCameraButton({ onClickFunc, fontSize = 1.75, color, userCss = {} }) {
    const newCss = Object.assign(
        {
            position: 'absolute',
            top: '85%',
            left: '5%',
            padding: '1%',
            border: '1px',
            borderStyle: 'solid',
            borderRadius: '50%',
            fontSize: fontSize.toString() + 'em',
            // next line stops cursor from changing to text selection on hover
            cursor: 'pointer',
            backgroundColor: color
        },
        userCss
    );

    return (
        <div css={newCss} onClick={onClickFunc}>
            <span css={{ padding: '.15em', fontSize: '2rem' }}>{'\u{1F4F7}'}</span>
        </div>
    );
}
