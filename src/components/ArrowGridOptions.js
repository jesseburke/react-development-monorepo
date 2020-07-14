import React, { useState, useRef, useEffect, useCallback } from 'react';

import Input from '../components/Input.js';

export default React.memo(function ArrowGridOptions({
    initDensity,
    initLength,
    densityCB,
    lengthCB,
    userCss = {}
}) {
    const newCss = useRef(
        Object.assign(
            {
                margin: 0,
                display: 'flex',
                height: '100%'
            },
            userCss
        ),
        [userCss]
    );

    const css1 = useRef(
        {
            margin: 0,
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        },
        []
    );

    const css2 = useRef({ textAlign: 'center' }, []);

    const css3 = useRef({ paddingTop: '.5em' }, []);

    const css4 = useRef(
        {
            margin: 0,
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            margin: '2em'
        },
        []
    );

    return (
        <div style={newCss.current}>
            <div style={css1.current}>
                <div style={css2.current}>Arrows per unit:</div>
                <span style={css3.current}>
                    <Input size={4} initValue={initDensity} onC={densityCB} />
                </span>
            </div>

            <div style={css4.current}>
                <div style={css2.current}>Relative arrow length:</div>
                <span style={css3.current}>
                    <Input size={4} initValue={initLength} onC={lengthCB} />
                </span>
            </div>
        </div>
    );
});
