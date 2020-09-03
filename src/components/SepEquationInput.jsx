import React, { useRef, useCallback, useState, useEffect } from 'react';

import Recoil from 'recoil';
const {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    useSetRecoilState,
    useRecoilCallback,
    atomFamily
} = Recoil;

import styles from './SepEquationInput.module.css';
import classnames from 'classnames';

import Input from './Input.jsx';

import funcParser from '../utils/funcParser.jsx';

export default React.memo(function SepEquationInput({ funcAtom, initXFuncStr, initYFuncStr }) {
    const [xFuncStr, setXFuncStr] = useState(initXFuncStr);
    const [yFuncStr, setYFuncStr] = useState(initYFuncStr);

    const setFunc = useSetRecoilState(funcAtom);

    const cssRef = useRef({ padding: '.25em' }, []);
    const cssRef2 = useRef({ paddingRight: '.5em' }, []);
    const cssRef3 = useRef({ padding: '1em 0em' }, []);

    const xFuncInputCB = useCallback((str) => setXFuncStr(str), []);
    const yFuncInputCB = useCallback((str) => setYFuncStr(str), []);

    useEffect(() => {
        if (!xFuncStr || !yFuncStr) return;

        const xFunc = funcParser(xFuncStr);
        const yFunc = funcParser(yFuncStr);

        setFunc({ func: (x, y) => xFunc(x, 0) * yFunc(0, y) });
    }, [xFuncStr, yFuncStr, setFunc]);

    return (
        <div
            className={classnames(
                styles['center-flex-column'],
                styles['right-border'],
                styles['large-right-padding'],
                styles['med-top-bottom-padding']
            )}
        >
            <div style={cssRef3.current}>
                dy/dx =<span style={cssRef.current}>h(y)</span>
                <span style={cssRef.current}>g(x)</span>
            </div>
            <div style={cssRef.current}>
                <span style={cssRef2.current}>
                    <span style={cssRef2.current}>h(y) = </span>
                    <Input size={10} initValue={initYFuncStr} onC={yFuncInputCB} />
                </span>
                <span>
                    <span css={cssRef2.current}>g(x) = </span>
                    <Input size={10} initValue={initXFuncStr} onC={xFuncInputCB} />
                </span>
            </div>
        </div>
    );
});
