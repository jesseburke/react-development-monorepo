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

            case 'readToAddressBar':
                let ro = {};

                Object.entries(atomsToCombine).forEach(([abbrev, atom]) =>
                    set(atom, {
                        type: 'readToAddressBar',
                        callback: (obj) => {
                            if (obj) ro[abbrev] = myStringify(obj);
                        }
                    })
                );

                if (isEmpty(ro)) return;
                action.callback(ro);
                break;

            case 'writeFromAddressBar':
                const objStr = action.value;

                if (!objStr || !objStr.length || objStr.length === 0) {
                    Object.entries(atomsToCombine).forEach(([abbrev, atom]) =>
                        set(atom, {
                            type: 'reset'
                        })
                    );
                    break;
                }

                const rawObj = queryString.parse(objStr);
                const newKeys = Object.keys(rawObj);

                let nro = {};

                Object.entries(atomsToCombine).forEach(([abbrev, atom]) => {
                    if (newKeys.includes(abbrev)) {
                        set(atom, {
                            type: 'writeFromAddressBar',
                            value: rawObj[abbrev]
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
