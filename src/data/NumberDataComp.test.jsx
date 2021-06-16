import { atom, useAtom } from 'jotai';

import { renderHook, act } from '@testing-library/react-hooks';

import NumberDataComp from './NumberDataComp.jsx';
import { myStringify } from '../utils/BaseUtils';

test('number data component', () => {
    const testNumberData = NumberDataComp(5);

    const { result, rerender } = renderHook(() => useAtom(testNumberData.atom));

    expect(result.current[0]).toBe(5);

    act(() => {
        result.current[1](10);
    });

    rerender();

    expect(result.current[0]).toBe(10);

    let abbrev;

    const readWriteFunc = renderHook(() => useAtom(testNumberData.readWriteAtom)).result.current[1];

    act(() => {
        readWriteFunc({
            type: 'readToAddressBar',
            callback: (obj) => {
                if (obj) abbrev = myStringify(obj);
            }
        });

        readWriteFunc({
            type: 'reset'
        });
    });

    rerender();

    expect(result.current[0]).toBe(5);

    act(() => {
        readWriteFunc({ type: 'writeFromAddressBar', value: abbrev });
    });

    rerender();

    expect(result.current[0]).toBe(10);
});
