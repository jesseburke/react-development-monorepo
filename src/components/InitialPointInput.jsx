import React, { useRef, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import Input from './Input.jsx';
import { round } from '../utils/BaseUtils.jsx';

const defaultVisibleAtom = atom(true);

export default function InitialPointInput({ initialPointAtom, visibleAtom = defaultVisibleAtom }) {
    const [initialPoint, setInitialPoint] = useAtom(initialPointAtom);

    const setX = useCallback((newX) => setInitialPoint((old) => ({ ...old, x: newX })), [
        setInitialPoint
    ]);
    const setY = useCallback((newY) => setInitialPoint((old) => ({ ...old, y: newY })), [
        setInitialPoint
    ]);

    const [visible] = useAtom(visibleAtom);

    const cssRef = useRef({ paddingRight: '5em' }, []);

    if (!visible) return null;

    return (
        <div style={cssRef.current}>
            <span>
                <span>Initial Point: </span>
                <Input initValue={round(initialPoint.x, 3)} size={8} onC={setX} />
                <span> , </span>
                <Input initValue={round(initialPoint.y, 3)} size={8} onC={setY} />
            </span>
        </div>
    );
}
