import * as React from 'react';

import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import GridGeometry from '../graphics/GridGeometry.js';

export default React.memo(function GridTS({
    threeCBs,
    center = [0, 0],
    gridShow = true,
    boundsAtom,
    gridCB = () => null
}) {
    const { xMax, xMin, yMax, yMin } = useAtom(boundsAtom)[0];

    React.useEffect(() => {
        if (!gridShow || !threeCBs) return;

        const grid = GridGeometry({ length: yMax - yMin, width: xMax - xMin, llc: [xMin, yMin] });

        threeCBs.add(grid);

        if (gridCB) gridCB(grid);

        return () => {
            if (grid) threeCBs.remove(grid);
        };
    }, [threeCBs, center, gridShow, gridCB, xMax, xMin, yMax, yMin]);

    return null;
});
