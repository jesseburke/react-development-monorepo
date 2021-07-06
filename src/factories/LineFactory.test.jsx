import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import * as THREE from 'three';

import LineFactory from './LineFactory';

test('intercepts', () => {
    const testPt1 = new THREE.Vector3(1, 1, 0);

    // with only 1 arg, gives line through origin
    const testLine = LineFactory(testPt1);

    expect(testLine.xIntercept()).toBe(0);
    expect(testLine.xIntercept(3)).toBe(3);

    expect(testLine.yIntercept()).toBe(0);
    expect(testLine.yIntercept(-2)).toBe(-2);

    const testPt2 = new THREE.Vector3(1, 2, 0);
    const vertLine = LineFactory(testPt1, testPt2);
    expect(vertLine.xIntercept()).toBe(null);
    expect(vertLine.xIntercept(1)).toBe(0);

    const testPt3 = new THREE.Vector3(0, 1, 0);
    const horizLine = LineFactory(testPt1, testPt3);
    expect(horizLine.yIntercept()).toBe(null);
    expect(horizLine.yIntercept(1)).toBe(0);
});
