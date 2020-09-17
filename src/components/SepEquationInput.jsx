import React, { useRef, useCallback, useState, useEffect } from 'react';

import { atom, useAtom } from 'jotai';

import styles from './SepEquationInput.module.css';
import classnames from 'classnames';

import Input from './Input.jsx';

const defaultXLabelAtom = atom('x');
const defaultYLabelAtom = atom('y');

export default React.memo(function SepEquationInput({
    xFuncStrAtom,
    yFuncStrAtom,
    xLabelAtom = defaultXLabelAtom,
    yLabelAtom = defaultYLabelAtom
}) {
    const [xFuncStr, setXFuncStr] = useAtom(xFuncStrAtom);
    const [yFuncStr, setYFuncStr] = useAtom(yFuncStrAtom);
    const [xLabel] = useAtom(xLabelAtom);
    const [yLabel] = useAtom(yLabelAtom);

    const cssRef = useRef({ padding: '.05em' }, []);
    const cssRef2 = useRef({ paddingRight: '.5em' }, []);
    const cssRef3 = useRef({ padding: '1em 0em' }, []);

    const xFuncInputCB = useCallback((str) => setXFuncStr(str), [setXFuncStr]);
    const yFuncInputCB = useCallback((str) => setYFuncStr(str), [setYFuncStr]);

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
                d{yLabel}/d{xLabel} =<span style={cssRef.current}>h({yLabel})</span>
                <span style={cssRef.current}>{'\u{00B7}'}</span>
                <span style={cssRef.current}>g({xLabel})</span>
            </div>
            <div style={cssRef.current}>
                <span style={cssRef2.current}>
                    <span style={cssRef2.current}>h({yLabel}) = </span>
                    <Input size={10} initValue={yFuncStr} onC={yFuncInputCB} />
                </span>
                <span>
                    <span css={cssRef2.current}>g({xLabel}) = </span>
                    <Input size={10} initValue={xFuncStr} onC={xFuncInputCB} />
                </span>
            </div>
        </div>
    );
});
