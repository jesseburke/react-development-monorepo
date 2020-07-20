import React, { useState, useRef, useEffect, useCallback } from 'react';

import styles from './CanvasComp.module.css';

//------------------------------------------------------------------------
//

export default React.memo(function CanvasComp({
    height = '100%',
    width = '100%',
    clearColor = '#f0f0f0',
    t0,
    children
}) {
    const canvasRef = useRef(null);

    const [ctx, setCtx] = useState(null);

    const [drawArray, setDrawArray] = useState([]);

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

    const addToDrawArray = useCallback(
        (drawFunc) => setDrawArray((oldArray) => oldArray.push(drawFunc)),
        []
    );

    useEffect(() => {
        if (!ctx) return;

        return () => {
            if (ctx) {
                ctx.fillStyle = clearColor; //'#AAA';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }
        };
    });

    return (
        <React.Fragment>
            <canvas
                className={styles.canvas}
                width={1024}
                height={1024}
                ref={(elt) => (canvasRef.current = elt)}
            />
            <React.Fragment>
                {React.Children.map(children, (el) => React.cloneElement(el, { ctx }))}
            </React.Fragment>
        </React.Fragment>
    );
});

//------------------------------------------------------------------------
//
// draw on canvas
