import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import TexDisplayComp from './TexDisplayComp.jsx';
import Slider from './Slider.jsx';

const precision = 3;
const logisticEquationTex = '\\frac{dx}{dt} = kx (1 - \\frac{x}{b})';

const defaultXLabelAtom = atom('t');
const defaultYLabelAtom = atom('x');

export default React.memo(function LogisticEquationInput({
    bAtom,
    kAtom,
    xLabelAtom = defaultXLabelAtom,
    yLabelAtom = defaultYLabelAtom
}) {
    const [b, setB] = useAtom(bAtom);
    const [k, setK] = useAtom(kAtom);
    const [xLabel] = useAtom(xLabelAtom);
    const [yLabel] = useAtom(yLabelAtom);

    const [texStr, setTexStr] = useState(
        '\\frac{d' + yLabel + '}{d' + xLabel + '} = k' + yLabel + '(1 - \\frac{' + yLabel + '}{b})'
    );

    useEffect(() => {
        setTexStr(
            '\\frac{d' +
                yLabel +
                '}{d' +
                xLabel +
                '} = k' +
                yLabel +
                '(1 - \\frac{' +
                yLabel +
                '}{b})'
        );
    }, [xLabel, yLabel]);

    const bCB = useCallback(
        (num) => {
            setB(Number.parseFloat(num));
        },
        [setB]
    );

    const kCB = useCallback(
        (num) => {
            setK(Number.parseFloat(num));
        },
        [setK]
    );

    const css1 = useRef(
        {
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '.5em 1em',
            fontSize: '1.25em',
            flex: 5
        },
        []
    );

    const css2 = useRef(
        {
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0em 3em'
        },
        []
    );

    const css3 = useRef({ padding: '.5em 0' }, []);

    const css4 = useRef({ padding: '.25em 0', textAlign: 'center' }, []);

    return (
        <div style={css1.current}>
            <div style={css2.current}>
                <div style={css4.current}>Logistic equation</div>
                <TexDisplayComp userCss={css3.current} str={texStr} />
            </div>
            <div>
                <Slider
                    userCss={css3.current}
                    value={b}
                    CB={bCB}
                    label={'b'}
                    max={40}
                    min={0.01}
                    precision={precision}
                />
            </div>
            <div>
                <Slider
                    userCss={css3.current}
                    value={k}
                    CB={kCB}
                    label={'k'}
                    max={100}
                    min={0.01}
                    precision={precision}
                />
            </div>
        </div>
    );
});
