import React, { useRef } from 'react';

import Recoil from 'recoil';
const { useRecoilValue, useSetRecoilState } = Recoil;

import Input from './Input.jsx';
import { round } from '../utils/BaseUtils.jsx';

export default function InitialPointInput({ ipAtom, xselector, yselector }) {
    const initialPoint = useRecoilValue(ipAtom);

    const setXS = useSetRecoilState(xselector);
    const setYS = useSetRecoilState(yselector);

    const cssRef = useRef({ paddingRight: '5em' }, []);

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
