import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import queryString from 'query-string-esm';

import { isEmpty } from '../utils/BaseUtils.ts';

export default function MainDataComp(atomStoreAtom) {
    const saveStuffAtom = atom({});

    const readAtomStoreSerializedAtom = atom(null, (get, set) => {
        let ro = {};

        const atomStore = get(atomStoreAtom);
        console.log(
            'atomStore, inside write function of readAtomStoreSerializedAtom, is',
            atomStore
        );

        Object.entries(atomStore).forEach(([abbrev, atom]) => {
            set(atom.serializeAtom, {
                type: 'serialize',
                callback: (obj) => {
                    if (obj) ro[abbrev] = myStringify(obj);
                }
            });
        });

        set(saveStuffAtom, ro);
        //console.log('ro is ', ro);
    });

    function useSaveToAddressBar() {
        const [saveStuff, setSaveStuff] = useAtom(saveStuffAtom);

        const readAt = useAtom(readAtomStoreSerializedAtom)[1];

        const saveCB = useCallback(() => {
            readAt();
        }, [readAt]);

        // whenever saveStuff changes, update the search bar
        useEffect(() => {
            if (isEmpty(saveStuff)) return;
            //console.log('saveStuff effect called with saveStuff = ', saveStuff);
            window.history.pushState(saveStuff, null, '?' + queryString.stringify(saveStuff));
        }, [saveStuff]);

        return saveCB;
    }

    const resetAtomStoreAtom = atom(null, (get, set) => {
        const atomStore = get(atomStoreAtom);

        // in the following, using that deserializing without value
        // resets atom to original value
        Object.values(atomStore).forEach((atom) => {
            set(atom.serializeAtom, {
                type: 'deserialize'
            });
        });
        window.history.pushState(null, null, '/');
    });

    function useReset() {
        return useAtom(resetAtomStoreAtom)[1];
    }

    const writeToAtomStoreAtom = atom(null, (get, set, newObj) => {
        const atomStore = get(atomStoreAtom);

        Object.keys(newObj).forEach((k) => {
            set(atomStore[k].serializeAtom, {
                type: 'deserialize',
                value: newObj[k]
            });
        });
    });

    // on load, parse the address bar data and dole it out to atoms
    function useReadAddressBar() {
        const writeToAtomStoreFunc = useAtom(writeToAtomStoreAtom)[1];
        const resetAtomStoreFunc = useAtom(resetAtomStoreAtom)[1];

        useLayoutEffect(() => {
            const qsObj = queryString.parse(window.location.search.slice(1));

            //console.log('read address bar effect called with qsObj = ', qsObj);

            writeToAtomStoreFunc(qsObj);
        }, [writeToAtomStoreFunc]);

        useEffect(() => {
            const popCb = (obj) => {
                if (!obj.state) {
                    resetAtomStoreFunc();
                    return;
                }
                writeToAtomStoreFunc(obj.state);
            };

            window.addEventListener('popstate', popCb);

            return () => {
                window.removeEventListener('popstate', popCb);
            };
        }, [writeToAtomStoreFunc, resetAtomStoreFunc]);
    }

    // the two components are optional; will be components that
    // represent buttons to click.
    // the classnames are also optional; if no component is passed in,
    // the classname args will be added as className
    function DataComp({ saveComp, saveBtnClassStr, resetComp, resetBtnClassStr }) {
        const saveCB = useSaveToAddressBar();
        const resetCB = useReset();

        useReadAddressBar();

        return (
            <div>
                {saveComp
                    ? React.cloneElement(saveComp, { onClick: saveCB })
                    : DefaultSaveComp(saveCB, saveBtnClassStr)}
                {resetComp
                    ? React.cloneElement(resetComp, { onClick: resetCB })
                    : DefaultResetComp(resetCB, resetBtnClassStr)}
            </div>
        );
    }

    return DataComp;
}

function DefaultSaveComp(
    saveCB,
    classNameStr = 'absolute left-8 bottom-40 p-2 border-2 rounded-md border-solid border-persian_blue-900 cursor-pointer text-xl'
) {
    return (
        <div onClick={saveCB}>
            <button className={classNameStr}>Save</button>
        </div>
    );
}

function DefaultResetComp(
    resetCB,
    classNameStr = 'absolute left-8 bottom-24 p-2 border-2 rounded-md border-solid border-persian_blue-900 cursor-pointer text-xl'
) {
    return (
        <div onClick={resetCB}>
            <button className={classNameStr}>Reset</button>
        </div>
    );
}

function DiscIconSaveComp({ saveCB }) {
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

    return (
        <div style={cssRef.current} onClick={saveCB}>
            <span style={cssRef2.current}>{'\u{1F4BE}'}</span>
        </div>
    );
}

function myStringify(obj) {
    if (typeof obj === 'string') return obj;

    return queryString.stringify(obj);
}
