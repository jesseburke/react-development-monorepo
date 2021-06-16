import React, { useEffect } from 'react';

import { atom, useAtom, ReadOnlyAtom } from 'jotai';

import GridGeom from '../graphics/GridGeom.js';
import { ArrayPoint2, Bounds } from '../my-types';

export interface GridProps {
    threeCBs?: Function;
    center?: ArrayPoint2;
    gridShow?: boolean;
    boundsAtom?: ReadOnlyAtom<Bounds>;
    gridCB?: Function;
}

export default (function GridTS({
    threeCBs,
    center = [0, 0],
    gridShow = true,
    boundsAtom,
    gridCB = () => null
}: GridProps) {
    const { xMax, xMin, yMax, yMin } = useAtom(boundsAtom)[0];

    useEffect(() => {
        if (!gridShow || !threeCBs) return;

        const grid = GridGeom({ length: yMax - yMin, width: xMax - xMin, llc: [xMin, yMin] });

        threeCBs.add(grid);

        if (gridCB) gridCB(grid);

        return () => {
            if (grid) threeCBs.remove(grid);
        };
    }, [threeCBs, center, gridShow, gridCB, xMax, xMin, yMax, yMin]);

    return null;
});
