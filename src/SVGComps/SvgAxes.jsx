import React, { useState, useRef, useEffect, useCallback, FunctionComponent } from 'react';
import { atom, useAtom } from 'jotai';

import { round } from '../utils/BaseUtils';

export default function SvgAxes({ mathBoundsAtom, svgBoundsAtom, zoomAtom }) {
    const { xMin: xMinMath, xMax: xMaxMath, yMin: yMinMath, yMax: yMaxMath } = useAtom(
        mathBoundsAtom
    )[0];

    const { xMin: xMinSvg, xMax: xMaxSvg, yMin: yMinSvg, yMax: yMaxSvg } = useAtom(
        svgBoundsAtom
    )[0];

    const zoom = useAtom(zoomAtom)[0];

    return (
        <>
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
                transform={`translate(${xMaxSvg - 100 / zoom}
		    ${(yMaxSvg - yMinSvg) / 2 + yMinSvg})  scale(${1 / zoom})`}
            >
                {`(${round(xMaxMath)}, ${round((yMaxMath - yMinMath) / 2 + yMinMath)})`}
            </text>
        </>
    );
}
