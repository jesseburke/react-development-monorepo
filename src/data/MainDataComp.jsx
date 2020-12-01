import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import { useResetAtom, useAtomCallback, useUpdateAtom } from 'jotai/utils';

import queryString from 'query-string-esm';

import classnames from 'classnames';
import styles from '../base_styles.module.css';

export default function MainDataComp(atomStore) {
    // following can write to all of the atoms in atomStore, but does
    // not update if they change
    const writerAtom = atom(null, (get, set, obj) => {
        Object.keys(obj).map((k) => {
            set(atomStore[k].atom, obj[k]);
        });
    });

    // the two components are optional; will be components that
    // represent buttons to click
    function DataComp({ saveComp, resetComp }) {
        const saveCB = useSaveToAddressBar();
        const resetCB = useReset();

        useReadAddressBar();

        return (
            <div>
                {saveComp
                    ? React.cloneElement(saveComp, { onClick: saveCB })
                    : DefaultSaveComp({ saveCB })}
                {resetComp
                    ? React.cloneElement(resetComp, { onClick: resetCB })
                    : DefaultResetComp({ resetCB })}
            </div>
        );
    }

    function useReset() {
        // could potentially make writeFunc a derived atom? derived
        // from the array of writerAtoms that are passed in
        const writeFunc = useAtom(writerAtom)[1];

        const resetCB = useCallback(() => {
            const writeObj = {};

            // when the decode functions are passed a null argument,
            // they return the initial values of the app
            Object.keys(atomStore).map((k) => {
                writeObj[k] = atomStore[k].decode();
            });

            writeFunc(writeObj);
            window.history.pushState(null, null, '/');
        }, [writeFunc]);

        return resetCB;
    }

    // on load, parse the address bar data and dole it out to atoms
    function useReadAddressBar() {
        const writeFunc = useAtom(writerAtom)[1];
        const storeKeys = Object.keys(atomStore);

        useEffect(() => {
            const qsObj = queryString.parse(window.location.search.slice(1));

            // for each new key, check if its a key in atomStore; if it
            // is, check if it has non-null decode function, and if so,
            // call it with the corresponding entry of newObj

            const writeObj = {};

            Object.keys(qsObj).map((k) => {
                if (storeKeys.includes(k) && atomStore[k].decode) {
                    writeObj[k] = atomStore[k].decode(qsObj[k]);
                }
            });

            writeFunc(writeObj);
        }, [writeFunc, storeKeys]);

        useEffect(() => {
            window.onpopstate = (obj) => {
                const writeObj = {};

                // if go back to original address, then obj.state is
                // null, and should reset everything
                if (!obj.state) {
                    Object.keys(atomStore).map((k) => {
                        writeObj[k] = atomStore[k].decode();
                    });
                } else {
                    Object.keys(obj.state).map((k) => {
                        if (storeKeys.includes(k) && atomStore[k].decode()) {
                            writeObj[k] = atomStore[k].decode(obj.state[k]);
                        }
                    });
                }

                writeFunc(writeObj);
                //console.log('onpopstate called with obj = ', obj.state);
            };
        }, [writeFunc, storeKeys]);
    }

    function useSaveToAddressBar() {
        const [saveStuff, setSaveStuff] = useState();

        const readAtoms = useAtomCallback(
            useCallback((get) => {
                const objToReturn = {};

                Object.entries(atomStore).map(([abbrev, { atom, encode }]) => {
                    const newValue = encode(get(atom));

                    // don't need to put empty strings in address bar
                    if (!newValue || newValue.length === 0) return;

                    objToReturn[abbrev] = newValue;
                });

                //console.log(returnObj);
                //console.log(queryString.stringify(returnObj));
                //console.log(queryString.parse(queryString.stringify(returnObj)));

                // the object is for pushing on history stack
                // and the string is for writing to the address bar
                return [objToReturn, queryString.stringify(objToReturn)];
            }, [])
        );

        const saveCB = useCallback(() => {
            readAtoms().then((st) => setSaveStuff(st));
        }, [readAtoms]);

        // whenever saveStuff changes, update the search bar
        useEffect(() => {
            if (!saveStuff || saveStuff[1].length === 0) return;

            window.history.pushState(saveStuff[0], null, '?' + saveStuff[1]);
        }, [saveStuff]);

        return saveCB;
    }

    return DataComp;
}

function DefaultSaveComp({ saveCB }) {
    const cssRef = useRef({
        position: 'absolute',
        top: '75%',
        left: '5%',
        padding: '1%',
        border: '1px',
        borderStyle: 'solid',
        borderRadius: '10%',
        fontSize: '1.25em',
        // next line stops cursor from changing to text selection on hover
        cursor: 'pointer'
    });

    return (
        <div onClick={saveCB}>
            <span style={cssRef.current}>Save</span>
        </div>
    );
}

function DefaultResetComp({ resetCB }) {
    const cssRef = useRef({
        position: 'absolute',
        top: '85%',
        left: '5%',
        padding: '1%',
        border: '1px',
        borderStyle: 'solid',
        borderRadius: '10%',
        fontSize: '1.25em',
        // next line stops cursor from changing to text selection on hover
        cursor: 'pointer'
    });

    return (
        <div onClick={resetCB}>
            <span style={cssRef.current}>Reset</span>
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
