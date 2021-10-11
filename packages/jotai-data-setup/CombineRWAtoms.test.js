import { atom, useAtom } from 'jotai';

import { renderHook, act, cleanup } from '@testing-library/react-hooks';

import CombineRWAtoms from './CombineRWAtoms';
import BoundsDataComp from './BoundsData';
import NumberDataComp from './NumberData';

import { isEmpty, myStringify } from '@jesseburke/basic-utils';

const testBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20, zMin: -20, zMax: 20 };
const testBoundsData = BoundsDataComp({ initBounds: testBounds });
const testNumData = NumberDataComp(5);

const comboRWAtom = CombineRWAtoms({
    bds: testBoundsData.readWriteAtom,
    n: testNumData.readWriteAtom
});

test('reset', () => {
    const { result: bresult, rerender: brerender } = renderHook(() => useAtom(testBoundsData.atom));

    const { result: nresult, rerender: nrerender } = renderHook(() => useAtom(testNumData.atom));

    const boundsReadWriteFunc = renderHook(() => useAtom(testBoundsData.readWriteAtom)).result
        .current[1];
    const numberReadWriteFunc = renderHook(() => useAtom(testNumData.readWriteAtom)).result
        .current[1];

    const comboReadWriteFunc = renderHook(() => useAtom(comboRWAtom)).result.current[1];

    act(() => {
        bresult.current[1]({ xMin: -10, xMax: 20, yMin: -20, yMax: 20, zMin: -20, zMax: 20 });

        nresult.current[1](10);

        comboReadWriteFunc({ type: 'reset' });
    });
    nrerender();
    expect(nresult.current[0]).toBe(5);
    expect(bresult.current[0].xMin).toBe(-20);
});

test('read and write', () => {
    const { result: bresult, rerender: brerender } = renderHook(() => useAtom(testBoundsData.atom));

    const { result: nresult, rerender: nrerender } = renderHook(() => useAtom(testNumData.atom));

    const boundsReadWriteFunc = renderHook(() => useAtom(testBoundsData.readWriteAtom)).result
        .current[1];
    const numberReadWriteFunc = renderHook(() => useAtom(testNumData.readWriteAtom)).result
        .current[1];

    const comboReadWriteFunc = renderHook(() => useAtom(comboRWAtom)).result.current[1];

    let addressBarString;

    act(() => {
        // set to something other than initial
        bresult.current[1]({ xMin: -10, xMax: 20, yMin: -20, yMax: 20, zMin: -20, zMax: 20 });

        nresult.current[1](23);

        // read those values to adddress bar string
        comboReadWriteFunc({
            type: 'readAndEncode',
            callback: (obj) => {
                if (obj) addressBarString = myStringify(obj);
            }
        });

        // reset back to initial
        comboReadWriteFunc({ type: 'reset' });

        // read values from address bar
        comboReadWriteFunc({ type: 'decodeAndWrite', value: addressBarString });
    });

    brerender();
    nrerender();
    expect(bresult.current[0].xMin).toBe(-10);
    expect(nresult.current[0]).toBe(23);
});
