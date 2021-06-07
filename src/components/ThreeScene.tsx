import React, { useState, useRef, useEffect, useCallback, FunctionComponent } from 'react';
import * as THREE from 'three';
import { atom, useAtom } from 'jotai';

import ThreeSceneFactory from '../ThreeSceneComps/ThreeSceneFactory';
import { ArrayPoint3 } from '../my-types';

//------------------------------------------------------------------------
//

export interface ThreeSceneProps {
    controlsCB: (pt: ArrayPoint3) => null;
    fixedCameraData: null;
    controlsData: null;
    clearColor: null;
    aspectRatio: null;
    photoButton: boolean;
    photoButtonClassStr: string;
    children: null;
}

const ThreeScene: FunctionComponent = ({
    controlsCB = null,
    fixedCameraData,
    controlsData = {
        mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
        touches: { ONE: THREE.MOUSE.ROTATE, TWO: THREE.TOUCH.PAN, THREE: THREE.MOUSE.DOLLY },
        enableRotate: true,
        enableKeys: true,
        enabled: false,
        keyPanSpeed: 50
    },
    clearColor = '#f0f0f0',
    aspectRatio = 1,
    photoButton = false,
    photoBtnClassStr = 'absolute left-6 bottom-6 p-1 border rounded-sm border-solid cursor-pointer text-xl',
    cameraDebug = false,
    halfWidth = false,
    children
}) => {
    const threeCanvasRef = useRef(null);
    const labelContainerRef = useRef(null);

    //------------------------------------------------------------------------
    //
    // make sure that canvas height and width are same as the html element

    const [initialHeightPxs, setInitialHeightPxs] = useState(0);
    const [initialWidthPxs, setInitialWidthPxs] = useState(0);

    useEffect(() => {
        if (threeCanvasRef && threeCanvasRef.current) {
            const height = threeCanvasRef.current.offsetHeight;
            const width = threeCanvasRef.current.offsetWidth;
            const pixelRatio = window.devicePixelRatio;

            if (height === 0 || width === 0) {
                requestAnimationFrame(() => {
                    setInitialHeightPxs(threeCanvasRef.current.offsetHeight);
                    setInitialWidthPxs(threeCanvasRef.current.offsetWidth);
                });
            } else {
                setInitialHeightPxs(height * pixelRatio);
                setInitialWidthPxs(width * pixelRatio);
            }
        }
    }, [threeCanvasRef]);

    //------------------------------------------------------------------------
    //
    // effect to put threeScene in state

    const debugDiv1Ref = useRef<HTMLDivElement>(null);
    const debugDiv2Ref = useRef<HTMLDivElement>(null);

    const [threeSceneCBs, setThreeSceneCBs] = useState(null);

    useEffect(() => {
        if (!threeCanvasRef.current) {
            setThreeSceneCBs(null);
            return;
        }

        if (initialHeightPxs === 0 || initialWidthPxs === 0) {
            setThreeSceneCBs(null);
            return;
        }

        if (cameraDebug) {
            setThreeSceneCBs(
                ThreeSceneFactory({
                    drawCanvas: threeCanvasRef.current,
                    labelContainerDiv: labelContainerRef.current,
                    fixedCameraData,
                    controlsData,
                    clearColor,
                    cameraDebug,
                    debugDiv1: debugDiv1Ref.current,
                    debugDiv2: debugDiv2Ref.current
                })
            );
        } else {
            setThreeSceneCBs(
                ThreeSceneFactory({
                    drawCanvas: threeCanvasRef.current,
                    labelContainerDiv: labelContainerRef.current,
                    fixedCameraData,
                    controlsData,
                    clearColor
                })
            );
        }
    }, [
        threeCanvasRef,
        labelContainerRef,
        controlsData,
        clearColor,
        cameraDebug,
        debugDiv1Ref,
        debugDiv2Ref,
        initialHeightPxs,
        initialWidthPxs
    ]);

    //----------------------------------------
    //
    // setup resize observer

    useEffect(() => {
        if (!threeSceneCBs || !threeSceneCBs.handleResize || !threeCanvasRef.current) return;

        const resizeObserver = new ResizeObserver(threeSceneCBs.handleResize);
        resizeObserver.observe(threeCanvasRef.current, { box: 'content-box' });

        return () => {
            if (resizeObserver && threeCanvasRef.current)
                resizeObserver.unobserve(threeCanvasRef.current);
        };
    }, [threeSceneCBs, threeCanvasRef]);

    //----------------------------------------
    //
    // subscribe to controlsPubSub

    useEffect(() => {
        if (!controlsCB || !threeSceneCBs) return;

        threeSceneCBs.controlsPubSub.subscribe(controlsCB);
    }, [controlsCB, threeSceneCBs]);

    //----------------------------------------
    //
    // set width class string

    const widthStr = halfWidth ? ' w-1/2' : ' w-full';

    //----------------------------------------
    //
    // component used for camera debugging (showing two screens, with
    // the left one the usual scene and the right one a second camera
    // and camera help on the first camera)

    const cameraDebugComp = useState(
        <div className='absolute top-0 left-0 h-full w-full outline-none flex'>
            <div
                className='h-full w-full'
                tabIndex='1'
                ref={(elt) => (debugDiv1Ref.current = elt)}
            ></div>
            <div
                className='h-full w-full'
                tabIndex='2'
                ref={(elt) => (debugDiv2Ref.current = elt)}
            ></div>
        </div>
    )[0];

    return (
        <div className={'absolute h-full bg-gray point-events-none' + widthStr}>
            <canvas
                className='h-full w-full block outline-none'
                ref={(elt) => (threeCanvasRef.current = elt)}
                width={initialWidthPxs}
                height={initialHeightPxs}
            />
            {cameraDebug ? cameraDebugComp : null}
            <React.Fragment>
                {React.Children.map(children, (el) =>
                    React.cloneElement(el, { threeCBs: threeSceneCBs })
                )}
            </React.Fragment>
            <div ref={(elt) => (labelContainerRef.current = elt)} />
            {photoButton ? (
                <div onClick={threeSceneCBs ? threeSceneCBs.downloadPicture : null}>
                    <button className={photoBtnClassStr}>Photo</button>
                </div>
            ) : null}
        </div>
    );
};

export const ThreeSceneComp = React.memo(ThreeScene);
