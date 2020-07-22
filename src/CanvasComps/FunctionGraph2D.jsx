import React, { useState, useRef, useEffect, useCallback } from 'react';

import FunctionGraphPts2D from '../math/FunctionGraphPts2D.jsx';

// compArray is an array of arrays; each array is a chain of points to be drawn
export default React.memo(function FunctionGraph2D({
    func,
    bounds,
    color = '#8BC34A',
    lineWidth = 5,
    addFunc,
    removeFunc
}) {
    const [ctx] = useState(document.createElement('canvas').getContext('2d'), []);

    const [compArray, setCompArray] = useState();

    useEffect(() => {
        if (!ctx) return;

        ctx.canvas.width = 1024;
        ctx.canvas.height = 1024;
    }, [ctx]);

    useEffect(() => {
        if (!ctx) return;

        ctx.strokeStyle = color;
    }, [color, ctx]);

    useEffect(() => {
        if (!ctx) return;

        ctx.lineWidth = lineWidth;
    }, [lineWidth, ctx]);

    useEffect(() => {
        setCompArray(FunctionGraphPts2D({ func, bounds }));
    }, [func, bounds]);

    const clearCanvas = useCallback(() => {
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }, [ctx]);

    useEffect(() => {
        if (!compArray || compArray.length === 0) return;

        clearCanvas();

        const { xMin, xMax, zMin, zMax } = bounds;

        const xRange = xMax - xMin;
        const zRange = zMax - zMin;

        const h = ctx.canvas.height;
        const w = ctx.canvas.width;

        const stc = ([x, z]) => [((x - xMin) / xRange) * w, (1 - (z - zMin) / zRange) * h];

        let curArray, l;

        for (let i = 0; i < compArray.length; i++) {
            curArray = compArray[i];
            l = curArray.length;

            ctx.beginPath();
            ctx.moveTo(...stc(curArray[0]));

            for (let i = 1; i < l; i++) {
                ctx.lineTo(...stc(curArray[i]));
            }
            ctx.stroke();
        }
        addFunc(ctx);

        return () => {
            if (ctx) removeFunc(ctx);
        };
    });

    return null;
});
