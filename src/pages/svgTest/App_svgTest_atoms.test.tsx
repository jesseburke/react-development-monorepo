import { atom, useAtom } from 'jotai';

import { renderHook, act, cleanup } from '@testing-library/react-hooks';

import { round } from '../../utils/BaseUtils';

import {
    initXBounds,
    initYCenter,
    upperLeftPointData,
    svgToMathFuncAtom,
    mathToSvgFuncAtom,
    svgHeightAndWidthAtom,
    svgBoundsAtom,
    zoomData
} from './App_svgTest_atoms';

const testHeight = 200;
const testWidth = 300;

const xCenter = (initXBounds.xMax + initXBounds.xMin) / 2;

describe('svgToMath and mathToSvg tests', () => {
    const setHeightAndWidth = renderHook(() => useAtom(svgHeightAndWidthAtom)).result.current[1];

    act(() => setHeightAndWidth({ height: testHeight, width: testWidth }));

    const svgToMathFunc = renderHook(() => useAtom(svgToMathFuncAtom)).result.current[0].func;
    const mathToSvgFunc = renderHook(() => useAtom(mathToSvgFuncAtom)).result.current[0].func;

    test('that svg center is mapped to math center', () => {
        const { x: newX, y: newY } = svgToMathFunc({ x: testWidth / 2, y: testHeight / 2 });

        expect(newX).toBeCloseTo(xCenter);
        expect(newY).toBeCloseTo(initYCenter);
    });

    test('that math center is mapped to svg center', () => {
        const { x: newX, y: newY } = mathToSvgFunc({ x: xCenter, y: initYCenter });

        expect(newX).toBeCloseTo(testWidth / 2);
        expect(newY).toBeCloseTo(testHeight / 2);
    });

    test('that svg to math to svg is identity', () => {
        const { x: newX, y: newY } = mathToSvgFunc(svgToMathFunc({ x: 152, y: 27 }));

        expect(newX).toBeCloseTo(152);
        expect(newY).toBeCloseTo(27);
    });

    test('that math to svg to math is identity', () => {
        const { x: newX, y: newY } = svgToMathFunc(mathToSvgFunc({ x: 1.45, y: -7.3 }));

        expect(newX).toBeCloseTo(1.45);
        expect(newY).toBeCloseTo(-7.3);
    });
});

test('svgBounds test', () => {
    const { result: svgResult, rerender: svgRender } = renderHook(() => useAtom(svgBoundsAtom));
    const { xMin, xMax, yMin, yMax } = svgResult.current[0];

    expect(xMin).toBe(0);
    expect(xMax).toBe(testWidth);
    expect(yMin).toBe(0);
    expect(yMax).toBe(testHeight);

    const { result: ulpResult, rerender: ulpRender } = renderHook(() =>
        useAtom(upperLeftPointData.atom)
    );
    const setUpperLeftPoint = ulpResult.current[1];

    act(() => setUpperLeftPoint({ x: -100, y: -100 }));
    svgRender();
    expect(svgResult.current[0].xMin).toBe(-100);
    expect(svgResult.current[0].xMax).toBe(-100 + testWidth);
    expect(svgResult.current[0].yMin).toBe(-100);
    expect(svgResult.current[0].yMax).toBe(-100 + testHeight);

    const { result: zoomResult, rerender: zoomRender } = renderHook(() => useAtom(zoomData.atom));

    const setZoom = zoomResult.current[1];

    act(() => setZoom(1.5));
    svgRender();

    const curCenter = { x: testWidth / 2, y: testHeight / 2 };
    expect(svgResult.current[0].xMin).toBeCloseTo(curCenter.x - testWidth / (2 * 1.5) - 100);
    expect(svgResult.current[0].yMin).toBeCloseTo(curCenter.y - testHeight / (2 * 1.5) - 100);
    expect(svgResult.current[0].xMax).toBeCloseTo(curCenter.x + testWidth / (2 * 1.5) - 100);
    expect(svgResult.current[0].yMax).toBeCloseTo(curCenter.y + testHeight / (2 * 1.5) - 100);
});
