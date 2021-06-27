import React, {
    Fragment,
    useRef,
    useEffect,
    useCallback,
    Children,
    cloneElement,
    createContext
} from 'react';
import { atom, useAtom } from 'jotai';

import SvgZoomBar from './SvgZoomBar';

const pixelRatio = 1; //window.devicePixelRatio;

export const SvgContext = createContext({});

export default ({ svgData, modeAtom, children }) => {
    const {
        svgHeightAndWidthAtom,
        svgBoundsAtom,
        mathBoundsAtom,
        upperLeftPointAtom,
        graphSqWAtom,
        zoomAtom,
        mathToSvgFuncAtom,
        zoomAtMaxAtom,
        zoomAtMinAtom
    } = svgData;

    const svgParentRef = useRef(null);
    const svgRef = useRef(null);

    const { xMin, xMax, yMin, yMax } = useAtom(svgBoundsAtom)[0];

    const [{ x: ulX, y: ulY }, setUpperLeftPoint] = useAtom(upperLeftPointAtom);

    const [zoom, zoomReducer] = useAtom(zoomAtom);

    const [{ height, width }, setHeightAndWidth] = useAtom(svgHeightAndWidthAtom);

    const [mode, setMode] = useAtom(modeAtom);

    const isDown = useRef<null | 'mouse' | 'touch'>(null);
    const lastPosition = useRef<[number, number]>();

    const zoomAtMax = useAtom(zoomAtMaxAtom)[0];
    const zoomAtMin = useAtom(zoomAtMinAtom)[0];

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
    // mouse pointer management

    useEffect(() => {
        if (mode === 'pan') {
            document.body.style.cursor = 'auto';
        }

        if (mode === 'center') {
            document.body.style.cursor = 'crosshair';
        }
    }, [mode]);

    const domToSvgCoords = useCallback(({ x: dx, y: dy }) => {
        if (!svgRef.current) return;

        const pt = svgRef.current.createSVGPoint();

        pt.x = dx;
        pt.y = dy;

        return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    }, []);

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
                    if (mode === 'pan') {
                        lastPosition.current = [e.clientX, e.clientY];
                    }
                    if (mode === 'center') {
                        const { x: newX, y: newY } = domToSvgCoords({ x: e.clientX, y: e.clientY });
                        setUpperLeftPoint({ x: newX - width / 2, y: newY - height / 2 });
                        setMode('pan');
                    }
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
                        setUpperLeftPoint((prev) => ({
                            x: prev.x - diffX / zoom,
                            y: prev.y - diffY / zoom
                        }));
                    }
                }
            }}
            onWheel={(e) => {
                if (e.deltaY < 0) {
                    zoomReducer('zoom in wheel');
                    console.log('wheel zoom in');
                } else if (e.deltaY > 0) {
                    zoomReducer('zoom out wheel');
                    console.log('wheel zoom out');
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
                viewBox={`${xMin} ${yMin} ${width / zoom} ${height / zoom}`}
                className='absolute h-full w-full'
                ref={(elt) => (svgRef.current = elt)}
            >
                <SvgContext.Provider
                    value={{
                        mathBoundsAtom,
                        svgBoundsAtom,
                        zoomAtom,
                        mathToSvgFuncAtom,
                        graphSqWAtom
                    }}
                >
                    {children}
                    <SvgZoomBar
                        zoomAtom={zoomAtom}
                        heightAndWidthAtom={svgHeightAndWidthAtom}
                        svgBoundsAtom={svgBoundsAtom}
                        modeAtom={modeAtom}
                        upperLeftPointAtom={upperLeftPointAtom}
                        zoomAtMax={zoomAtMax}
                        zoomAtMin={zoomAtMin}
                    />
                </SvgContext.Provider>
            </svg>
        </div>
    );
};
