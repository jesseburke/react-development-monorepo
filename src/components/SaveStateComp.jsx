import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

const identity = (x) => x;

function strArrayToArray(strArray, f = identity) {
    // e.g., '2,4,-32.13' -> [2, 4, -32.13]
    // f is a function applied to the string representing each array element

    return strArray.split(',').map((x) => f(x));
}

export default React.memo(function SaveStateComp({ decode, encode, atomArray, children }) {
    const atomValueArray = atomArray.map((a) => useAtom(a)[0]);
    const atomSetterArray = atomArray.map((a) => useAtom(a)[1]);

    useEffect(() => {
        const qs = window.location.search;

        if (qs.length === 0) {
            return;
        }

        let { state: newStateArray } = queryString.parse(qs.slice(1));

        newStateArray = decode(strArrayToArray(newStateArray));

        for (let i = 0; i < newStateArray.length; i++) {
            atomSetterArray[i](newStateArray[i]);
        }
    }, []);

    const cb = useCallback(() => {
        const stateStr = encode(atomValueArray);

        window.history.replaceState(
            null,
            null,
            '?' +
                queryString.stringify(
                    { state: stateStr },
                    {
                        decode: true,
                        encode: true,
                        arrayFormat: 'comma'
                    }
                )
        );
    }, [encode, atomValueArray]);

    const cssRef = useRef({
        position: 'absolute',
        top: '85%',
        left: '5%',
        padding: '1%',
        border: '1px',
        borderStyle: 'solid',
        borderRadius: '50%',
        // next line stops cursor from changing to text selection on hover
        cursor: 'pointer'
    });

    const cssRef2 = useRef({ padding: '.15em', fontSize: '2rem' });

    const component = children ? (
        React.cloneElement(children[0], { onClick: cb })
    ) : (
        <div style={cssRef.current} onClick={cb}>
            <span style={cssRef2.current}>{'\u{1F4BE}'}</span>
        </div>
    );

    return component;
});
