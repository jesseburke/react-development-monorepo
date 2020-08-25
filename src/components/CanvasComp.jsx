import React, { useState, useRef, useEffect, useCallback } from 'react';

import styles from './CanvasComp.module.css';

import { useImmer } from 'use-immer';
import { enableMapSet } from 'immer';

enableMapSet();

//------------------------------------------------------------------------
//

const defaultHeightPxs = 1024;

export default React.memo(function CanvasComp({
    aspectRatio = 1,
    height = '100%',
    width = '100%',
    clearColor = '#f0f0f0',
    children
}) {
    const canvasRef = useRef(null);

    const [ctx, setCtx] = useState(null);

    const heightPxs = useRef(defaultHeightPxs);
    const widthPxs = useRef(heightPxs.current * aspectRatio);

    const [canvasSet, setCanvasSet] = useImmer(new Set());

    useEffect(() => {
        if (!canvasRef.current) {
            setCtx(null);
            return;
        }

        const wc = canvasRef.current.getContext('2d');

        wc.fillStyle = clearColor; //'#AAA';
        wc.fillRect(0, 0, wc.canvas.width, wc.canvas.height);
        wc.lineJoin = 'round';

        setCtx(wc);
    }, [canvasRef, clearColor]);

    const addCanvasToSet = useCallback(
        (newCanv) =>
            setCanvasSet((draft) => {
                draft.add(newCanv);
            }),
        []
    );

    const removeCanvasFromSet = useCallback(
        (newCanv) =>
            setCanvasSet((draft) => {
                draft.delete(newCanv);
            }),
        []
    );

    // drawing effect
    useEffect(() => {
        if (!ctx || canvasSet.length == 0) return;

        [...canvasSet].forEach((c) => {
            //console.log('drawing canvas ', c);
            ctx.drawImage(c.canvas, 0, 0);
        });

        return () => {
            if (ctx) {
                ctx.fillStyle = clearColor; //'#AAA';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }
        };
    }, [ctx, canvasSet]);

    return (
        <React.Fragment>
            <canvas
                className={styles.canvas}
                width={widthPxs.current}
                height={heightPxs.current}
                ref={(elt) => (canvasRef.current = elt)}
            />
            <React.Fragment>
                {React.Children.map(children, (el) =>
                    React.cloneElement(el, {
                        addFunc: addCanvasToSet,
                        removeFunc: removeCanvasFromSet,
                        canvasWidth: widthPxs.current,
                        canvasHeight: heightPxs.current
                    })
                )}
            </React.Fragment>
        </React.Fragment>
    );
});

//------------------------------------------------------------------------
//
// draw on canvas
