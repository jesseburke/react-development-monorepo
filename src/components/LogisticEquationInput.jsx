import React, { useState, useRef, useEffect, useCallback } from 'react';

import Recoil from 'recoil';
const { RecoilRoot, atom, selector, useRecoilValue, useRecoilState, useSetRecoilState } = Recoil;

import TexDisplayComp from './TexDisplayComp.jsx';
import Slider from './Slider.jsx';

const precision = 3;
const logisticEquationTex = '\\frac{dx}{dt} = kx (1 - \\frac{x}{b})';

export default React.memo(function LogisticEquationInput({ bAtom, kAtom }) {
    const [bVal, setBVal] = useRecoilState(bAtom);
    const [kVal, setKVal] = useRecoilState(kAtom);

    const bCB = useCallback(
        (num) => {
            setBVal(Number.parseFloat(num));
        },
        [setBVal]
    );

    const kCB = useCallback(
        (num) => {
            setKVal(Number.parseFloat(num));
        },
        [setKVal]
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
            borderRight: '1px solid',
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
                <TexDisplayComp userCss={css3.current} str={logisticEquationTex} />
            </div>
            <div>
                <Slider
                    userCss={css3.current}
                    value={bVal}
                    CB={bCB}
                    label={'b'}
                    max={20}
                    min={0.001}
                    precision={precision}
                />
            </div>
            <div>
                <Slider
                    userCss={css3.current}
                    value={kVal}
                    CB={kCB}
                    label={'k'}
                    max={20}
                    min={0.001}
                    precision={precision}
                />
            </div>
        </div>
    );
});
