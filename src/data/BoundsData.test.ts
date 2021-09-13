import { atom, useAtom } from 'jotai';

import { renderHook, act, cleanup } from '@testing-library/react-hooks';

import BoundsDataComp from './BoundsData';
import { myStringify } from '@jesseburke/basic-utils';

const testBounds = { xMin: -20, xMax: 20, yMin: -20, yMax: 20, zMin: -20, zMax: 20 };

describe('test readWriteAtom', () => {
    const testBoundsData = BoundsDataComp({ initBounds: testBounds });
    const readWriteFunc = renderHook(() => useAtom(testBoundsData.readWriteAtom)).result.current[1];

    test('get, set, and reset', () => {
        const { result, rerender } = renderHook(() => useAtom(testBoundsData.atom));
        expect(result.current[0].xMin).toBe(-20);

        act(() => {
            result.current[1]((prevVal) => ({ ...prevVal, xMin: -10 }));
        });

        rerender();

        expect(result.current[0].xMin).toBe(-10);

        act(() => {
            readWriteFunc({
                type: 'reset'
            });
        });
        rerender();
        expect(result.current[0].xMin).toBe(-20);
    });

    test('read and write', () => {
        const { result, rerender } = renderHook(() => useAtom(testBoundsData.atom));
        let queryString;

        act(() => {
            // set bounds to something random and diff from initial
            result.current[1]({ xMin: -10, xMax: 102.1, yMin: -7.34, yMax: 1003 });

            // read that value to adddress bar string
            readWriteFunc({
                type: 'readToAddressBar',
                callback: (obj) => {
                    if (obj) queryString = myStringify(obj);
                }
            });

            // reset back to initial
            readWriteFunc({
                type: 'reset'
            });

            // write value from address bar
            readWriteFunc({ type: 'writeFromAddressBar', value: queryString });
        });
        rerender();
        expect(result.current[0].yMin).toBe(-7.34);
        expect(result.current[0].yMax).toBe(1003);
    });
});
