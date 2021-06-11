import React, { useState, useRef, useEffect, useCallback, FunctionComponent } from 'react';
import { atom, useAtom } from 'jotai';

import SvgZoomBar from './SvgZoomBar';

const pixelRatio = 1; //window.devicePixelRatio;

const SvgScene: FunctionComponent = ({
    heightAndWidthAtom,
    boundsAtom,
    upperLeftPointAtom,
    zoomAtom,
    mathToSvgFuncAtom,
    children
}) => {
    const svgParentRef = useRef(null);
    const svgRef = useRef(null);

    const { xMin, xMax, yMin, yMax } = useAtom(boundsAtom)[0];

    const [{ x: ulX, y: ulY }, setCenter] = useAtom(upperLeftPointAtom);

    const zoom = useAtom(zoomAtom)[0];

    const [{ height, width }, setHeightAndWidth] = useAtom(heightAndWidthAtom);

    const mathToSvgFunc = useAtom(mathToSvgFuncAtom)[0].func;

    const isDown = useRef<null | 'mouse' | 'touch'>(null);
    const lastPosition = useRef<[number, number]>();

    useEffect(() => {
        if (!svgParentRef.current) {
            setHeightAndWidth({ height: 0, width: 0 });
            return;
        }

        let newHeight = svgParentRef.current.offsetHeight * pixelRatio;
        let newWidth = svgParentRef.current.offsetWidth * pixelRatio;

        if (newHeight === 0 || newWidth === 0) {
            requestAnimationFrame(() => {
                newHeight = svgParentRef.current.offsetHeight * pixelRatio;
                newWidth = svgParentRef.current.offsetWidth * pixelRatio;

                setHeightAndWidth({ height: newHeight, width: newWidth });
            });
        } else {
            setHeightAndWidth({ height: newHeight, width: newWidth });
        }
    }, [svgParentRef.current]);

    //----------------------------------------
    //
    // setup resize observer

    const resizeCB = useCallback(() => {
        const newHeight = svgParentRef.current.offsetHeight * pixelRatio;
        const newWidth = svgParentRef.current.offsetWidth * pixelRatio;

        setHeightAndWidth({ height: newHeight, width: newWidth });
    }, [setHeightAndWidth, svgParentRef]);

    useEffect(() => {
        if (!svgParentRef.current) return;

        const resizeObserver = new ResizeObserver(resizeCB);
        resizeObserver.observe(svgParentRef.current, { box: 'content-box' });

        return () => {
            if (resizeObserver && svgParentRef.current)
                resizeObserver.unobserve(svgParentRef.current);
        };
    }, [resizeCB, svgParentRef]);

    //----------------------------------------
    //
    // component

    return (
        <div
            className='h-full w-full relative'
            ref={(elt) => (svgParentRef.current = elt)}
            onMouseDown={(e) => {
                //console.log('mouse down event fired');
                if (e.button === 0 && !isDown.current) {
                    isDown.current = 'mouse';
                    lastPosition.current = [e.clientX, e.clientY];
                }
            }}
            onMouseUp={(e) => {
                if (isDown.current === 'mouse') {
                    isDown.current = null;
                }
            }}
            onMouseMove={(e) => {
                //console.log('mouse move event fired');
                if (isDown.current === 'mouse') {
                    const pos = [e.clientX, e.clientY];

                    if (lastPosition.current) {
                        const diffX = pos[0] - lastPosition.current[0];
                        const diffY = pos[1] - lastPosition.current[1];
                        lastPosition.current = pos;
                        setCenter((prev) => ({
                            x: prev.x - diffX / zoom,
                            y: prev.y - diffY / zoom
                        }));
                    }
                }
            }}
            onTouchStart={(e) => {
                e.stopPropagation();
            }}
            onTouchEnd={(e) => {
                e.stopPropagation();
            }}
            onTouchMove={(e) => {
                e.stopPropagation();
            }}
        >
            <svg
                viewBox={`${ulX} ${ulY} ${width / zoom} ${height / zoom}`}
                className='h-full w-full'
                ref={(elt) => (svgRef.current = elt)}
            >
                <rect x='0' y='0' fill='red' width='10' height='10' />
                <text x='100' y='20' style={{ userSelect: 'none', pointerEvents: 'none' }}>
                    "Hello!"
                </text>
                <SvgZoomBar
                    zoomAtom={zoomAtom}
                    heightAndWidthAtom={heightAndWidthAtom}
                    upperLeftPointAtom={upperLeftPointAtom}
                />
            </svg>
        </div>
    );
};

export default React.memo(SvgScene);

/* transform={`scale(${width / (xMax - xMin)})
 *         rotate(180) translate(-20,-13)`} */
