import { atom, useAtom } from 'jotai';

import { renderHook, act } from '@testing-library/react-hooks';

import NumberDataComp from './NumberData.jsx';
import { myStringify } from '@jesseburke/basic-utils';

describe('number data component', () => {
    const testNumberData = NumberDataComp(5);

    const readWriteFunc = renderHook(() => useAtom(testNumberData.readWriteAtom)).result.current[1];

    test('get, set, and reset', () => {
        const { result, rerender } = renderHook(() => useAtom(testNumberData.atom));
        expect(result.current[0]).toBe(5);

        act(() => {
            result.current[1](10);
        });
        rerender();
        expect(result.current[0]).toBe(10);

        act(() => {
            readWriteFunc({
                type: 'reset'
            });
        });
        rerender();
        expect(result.current[0]).toBe(5);
    });

    test('read and write', () => {
        const { result, rerender } = renderHook(() => useAtom(testNumberData.atom));
        let queryString;

        act(() => {
            // set testNumber to 10
            result.current[1](10);
            // read that value to adddress bar string
            readWriteFunc({
                type: 'readToAddressBar',
                callback: (obj) => {
                    if (obj) queryString = myStringify(obj);
                }
            });
            // set testNumber back to 5
            result.current[1](5);

            // read value from address bar
            readWriteFunc({ type: 'writeFromAddressBar', value: queryString });
        });
        rerender();
        expect(result.current[0]).toBe(10);
    });
});
