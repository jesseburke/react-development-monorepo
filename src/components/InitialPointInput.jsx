import React, { useRef } from 'react';

import { atom, useAtom } from 'jotai';

import Input from './Input.jsx';
import { round } from '../utils/BaseUtils.jsx';

export default function InitialPointInput({
    ipAtom,
    xselector,
    yselector,
    visibleAtom = atom(true)
}) {
    const [initialPoint] = useAtom(ipAtom);

    const [, setXS] = useAtom(xselector);
    const [, setYS] = useAtom(yselector);

    const [visible] = useAtom(visibleAtom);

    const cssRef = useRef({ paddingRight: '5em' }, []);

    if (!visible) return null;

    return (
        <div style={cssRef.current}>
            <span>
                <span>Initial Point: </span>
                <Input initValue={round(initialPoint.x, 3)} size={8} onC={setXS} />
                <span> , </span>
                <Input initValue={round(initialPoint.y, 3)} size={8} onC={setYS} />
            </span>
        </div>
    );
}
