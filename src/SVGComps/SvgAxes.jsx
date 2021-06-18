import React, { useState, useRef, useEffect, useCallback, FunctionComponent } from 'react';
import { atom, useAtom } from 'jotai';

import { round } from '../utils/BaseUtils';

export default function SvgAxes({ mathBoundsAtom, svgBoundsAtom, zoomAtom, mathToSvgFuncAtom }) {
    const { xMin: xMinMath, xMax: xMaxMath, yMin: yMinMath, yMax: yMaxMath } = useAtom(
        mathBoundsAtom
    )[0];

    const { xMin: xMinSvg, xMax: xMaxSvg, yMin: yMinSvg, yMax: yMaxSvg } = useAtom(
        svgBoundsAtom
    )[0];

    const mathToSvgFunc = useAtom(mathToSvgFuncAtom)[0].func;

    const zoom = useAtom(zoomAtom)[0];

    const { x: svgXC, y: svgYC } = mathToSvgFunc({ x: 0, y: 0 });

    let xOnScreen = false;

    if (xMinSvg <= svgXC && svgXC <= xMaxSvg) {
        xOnScreen = true;
    }

    let yOnScreen = false;

    if (yMinSvg <= svgYC && svgYC <= yMaxSvg) {
        yOnScreen = true;
    }

    const originRadius = 10;
    const axesWidth = 2;

    return (
        <>
            <g>
                {xOnScreen ? (
                    <line
                        x1={svgXC}
                        y1={yMinSvg}
                        x2={svgXC}
                        y2={yMaxSvg}
                        stroke='black'
                        strokeWidth={axesWidth / zoom}
                    />
                ) : null}
                {yOnScreen ? (
                    <line
                        y1={svgYC}
                        x1={xMinSvg}
                        y2={svgYC}
                        x2={xMaxSvg}
                        stroke='black'
                        strokeWidth={axesWidth / zoom}
                    />
                ) : null}
                {xOnScreen && yOnScreen ? (
                    <circle
                        cx={0}
                        cy={0}
                        r={originRadius}
                        stroke='red'
                        fill='red'
                        transform={`translate(${mathToSvgFunc({ x: 0, y: 0 }).x} ${
                            mathToSvgFunc({ x: 0, y: 0 }).y
                        }) scale(${1 / zoom})`}
                    />
                ) : null}
            </g>
            <text
                style={{ userSelect: 'none', pointerEvents: 'none' }}
                transform={`translate(${(xMaxSvg - xMinSvg) / 2 + xMinSvg} ${
                    yMinSvg + 20 / zoom
                }) scale(${1 / zoom})`}
            >
                {`(${round((xMaxMath - xMinMath) / 2 + xMinMath)}, ${round(yMaxMath)})`}
            </text>
            <text
                style={{ userSelect: 'none', pointerEvents: 'none' }}
                transform={`translate(${(xMaxSvg - xMinSvg) / 2 + xMinSvg} ${yMaxSvg - 10 / zoom})
        scale(${1 / zoom})`}
            >
                {`(${round(xMinMath + (xMaxMath - xMinMath) / 2)}, ${round(yMinMath)})`}
            </text>
            <text
                style={{ userSelect: 'none', pointerEvents: 'none' }}
                transform={`translate(${xMaxSvg - 80 / zoom}
		    ${(yMaxSvg - yMinSvg) / 2 + yMinSvg})  scale(${1 / zoom})`}
            >
                {`(${round(xMaxMath)}, ${round((yMaxMath - yMinMath) / 2 + yMinMath)})`}
            </text>
            <text
                style={{ userSelect: 'none', pointerEvents: 'none' }}
                transform={`translate(${xMinSvg + 20 / zoom}
		    ${(yMaxSvg - yMinSvg) / 2 + yMinSvg})  scale(${1 / zoom})`}
            >
                {`(${round(xMinMath)}, ${round((yMaxMath - yMinMath) / 2 + yMinMath)})`}
            </text>
        </>
    );
}
