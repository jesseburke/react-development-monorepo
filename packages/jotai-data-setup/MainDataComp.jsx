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
import * as Tooltip from '@radix-ui/react-tooltip';

import { myStringify } from '@jesseburke/basic-utils';

export default function MainDataComp(atomStoreAtom) {
    
    const readAtomStoreAtom = atom(null, (get, set, callback) => {

	const atomStore = get(atomStoreAtom);
        let ro = {};

        Object.entries(atomStore).forEach(([abbrev, atom]) => {
            set(atom, {
                type: 'readToAddressBar',
                callback: (obj) => {
                    if (obj) ro[abbrev] = myStringify(obj);
                }
            });
        });

        callback(ro);
    });

    const resetAtomStoreAtom = atom(null, (get, set) => {
	const atomStore = get(atomStoreAtom);
	
        Object.values(atomStore).forEach((atom) => {
            set(atom, {
                type: 'reset'
            });
        });
    });

    const writeToAtomStoreAtom = atom(null, (get, set, newObj) => {
	const atomStore = get(atomStoreAtom);
	
        Object.keys(newObj).forEach((k) => {
            set(atomStore[k], {
                type: 'writeFromAddressBar',
                value: newObj[k]
            });
        });
    });

    function useSaveToAddressBar() {
        const readAtomStore = useAtom(readAtomStoreAtom)[1];

        const saveCB = useCallback(() => {
            let saveObj;
            readAtomStore((obj) => {
                saveObj = obj;
            });
            window.history.pushState(saveObj, null, '?' + queryString.stringify(saveObj));
        }, [readAtomStore]);

        return saveCB;
    }

    function useResetAddressBar() {
        const resetAtomStore = useAtom(resetAtomStoreAtom)[1];

        const resetCB = useCallback(() => {
            resetAtomStore();
            window.history.pushState(null, null, location.href.split('?')[0]);
        }, [resetAtomStore]);

        return resetCB;
    }

    // on load, parse the address bar data and dole it out to atoms
    function useReadAddressBar() {
        const writeToAtomStoreFunc = useAtom(writeToAtomStoreAtom)[1];
        const resetAtomStoreFunc = useAtom(resetAtomStoreAtom)[1];

        useLayoutEffect(() => {
            const qsObj = queryString.parse(window.location.search.slice(1));

            console.log('read address bar effect called with qsObj = ', qsObj);

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
        const resetCB = useResetAddressBar();

        useReadAddressBar();

        return (
            <div>
                {saveComp
                    ? cloneElement(saveComp, { onClick: saveCB })
                    : DefaultSaveComp(saveCB, saveBtnClassStr)}
                {resetComp
                    ? cloneElement(resetComp, { onClick: resetCB })
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
        <Tooltip.Root>
            <Tooltip.Trigger className={classNameStr} onClick={saveCB}>
                Save
            </Tooltip.Trigger>
            <Tooltip.Content>Save the state in the address bar</Tooltip.Content>
        </Tooltip.Root>
    );
}

function DefaultResetComp(
    resetCB,
    classNameStr = 'absolute left-8 bottom-24 p-2 border-2 rounded-md border-solid border-persian_blue-900 cursor-pointer text-xl'
) {
    return (
        <Tooltip.Root>
            <Tooltip.Trigger className={classNameStr} onClick={resetCB}>
                Reset
            </Tooltip.Trigger>
            <Tooltip.Content>
                Reset the app to its initial state. If you first click save, the back button will
                return to the current state after reset.
            </Tooltip.Content>
        </Tooltip.Root>
    );
}
