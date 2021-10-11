import React, {
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
    useCallback,
    cloneElement
} from 'react';
import { atom, useAtom } from 'jotai';
import queryString from 'query-string-esm';

import { isEmpty, myStringify } from '@jesseburke/basic-utils';

export default function CombineReadWriteAtoms(atomsToCombine) {
    const newRWAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                Object.values(atomsToCombine).forEach((atom) => {
                    set(atom, {
                        type: 'reset'
                    });
                });
                break;

            case 'readAndEncode':
                let ro = {};

                Object.entries(atomsToCombine).forEach(([abbrev, atom]) =>
                    set(atom, {
                        type: 'readAndEncode',
                        callback: (obj) => {
                            if (obj) ro[abbrev] = myStringify(obj);
                        }
                    })
                );

                if (isEmpty(ro)) return;
                action.callback(ro);
                break;

            case 'decodeAndWrite':
         
                const rawObj = action.value;
                const newKeys = Object.keys(rawObj);

                let nro = {};

                Object.entries(atomsToCombine).forEach(([abbrev, atom]) => {
                    if (newKeys.includes(abbrev)) {
                        set(atom, {
                            type: 'decodeAndWrite',
                            value: queryString.parse(rawObj[abbrev])
                        });
                    }
                });

                if (isEmpty(nro)) return;
                action.callback(nro);
                break;
        }
    });

    return newRWAtom;
}
