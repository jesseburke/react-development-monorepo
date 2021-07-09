import React, { useCallback, useState, useRef, useEffect, useLayoutEffect } from 'react';

import { renderHook, act, cleanup } from '@testing-library/react-hooks';

describe('useCallback tests', () => {
    test('whether changing ref value causes callback to change', () => {
        const testRef = renderHook(() => useRef(1)).result.current;

        let v = 0;

        const { result, rerender } = renderHook(() =>
            useCallback(() => {
                v = v + testRef.current;
            }, [testRef.current])
        );

        act(() => {
            testRef.current = 2;
        });

        rerender();

        act(() => {
            result.current();
        });

        expect(v).toBe(2);
    });
});
