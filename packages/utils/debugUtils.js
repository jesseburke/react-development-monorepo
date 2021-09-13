import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom, Provider as JProvider } from 'jotai';

export const DebugComp = () => {
    useDebug();

    return null;
};

export const useDebug = (debugAtomArray = []) => {
    debugAtomArray.forEach((atm) => {
        //console.log('debugAtomArray element ', atm, 'inside useDebug');
        useTrackAtom(atm);
    });
};

const useTrackAtom = (atom) => {
    const atomValue = useAtom(atom)[0];

    useEffect(() => {
        console.log('atom ', atom, 'changed to ', atomValue);

        return () => {
            console.log('return: atom ', atom, 'changed from ', atomValue);
        };
    }, [atomValue, atom]);
};

export function useTraceRender(props) {
    const prev = useRef(props);
    useEffect(() => {
        const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
            if (prev.current[k] !== v) {
                ps[k] = [prev.current[k], v];
            }
            return ps;
        }, {});
        if (Object.keys(changedProps).length > 0) {
            console.log('Changed props:', changedProps);
        }
        prev.current = props;
    });
}
