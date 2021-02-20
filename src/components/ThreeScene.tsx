import React, { useState, useRef, useEffect, FunctionComponent } from 'react';
import * as THREE from 'three';
import { atom, useAtom } from 'jotai';

import ThreeSceneFactory from '../ThreeScene/ThreeSceneFactory';
import { ArrayPoint3 } from '../my-types';

//------------------------------------------------------------------------
//

const defaultHeightPxs = 1024;

export interface ThreeSceneProps {
    controlsCB: (pt: ArrayPoint3) => null;
    initCameraData: null;
    fixedCameraData: null;
    controlsData: null;
    clearColor: null;
    aspectRatio: null;
    showPhotoBtn: boolean;
    photoBtnClassStr: string;
    children: null;
}

const ThreeScene: FunctionComponent = (
    {
        controlsCB = null,
        initCameraData = { position: [10, 10, 10], up: [0, 0, 1], fov: 75 },
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
        showPhotoBtn = false,
        photoBtnClassStr = 'absolute left-6 bottom-6 p-1 border rounded-sm border-solid cursor-pointer text-xl',
        cameraDebug = false,
        children
    },
    ref
) => {
    const threeCanvasRef = useRef(null);
    const labelContainerRef = useRef(null);

    const [threeSceneCBs, setThreeSceneCBs] = useState(null);

    //------------------------------------------------------------------------
    //
    // effect to put threeScene in state

    const debugDiv1Ref = useRef<HTMLDivElement>(null);
    const debugDiv2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!threeCanvasRef.current) {
            setThreeSceneCBs(null);
            return;
        }

        if (cameraDebug) {
            setThreeSceneCBs(
                ThreeSceneFactory({
                    drawCanvas: threeCanvasRef.current,
                    labelContainerDiv: labelContainerRef.current,
                    initCameraData,
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
                    initCameraData,
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
        debugDiv2Ref
    ]);

    //------------------------------------------------------------------------
    //
    // subscribe to controlsPubSub

    useEffect(() => {
        if (!controlsCB || !threeSceneCBs) return;

        threeSceneCBs.controlsPubSub.subscribe(controlsCB);
    }, [controlsCB, threeSceneCBs]);

    const heightPxs = useRef(defaultHeightPxs);
    const widthPxs = useRef(heightPxs.current * aspectRatio);

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
        <div
            className='absolute h-full w-full bg-gray
            point-events-none'
        >
            <canvas
                className='h-full w-full block outline-none'
                width={widthPxs.current}
                height={heightPxs.current}
                ref={(elt) => (threeCanvasRef.current = elt)}
            />
            {cameraDebug ? cameraDebugComp : null}
            <React.Fragment>
                {React.Children.map(children, (el) =>
                    React.cloneElement(el, { threeCBs: threeSceneCBs })
                )}
            </React.Fragment>
            <div ref={(elt) => (labelContainerRef.current = elt)} />
            {showPhotoBtn ? (
                <div onClick={threeSceneCBs ? threeSceneCBs.downloadPicture : null}>
                    <button className={photoBtnClassStr}>Photo</button>
                </div>
            ) : null}
        </div>
    );
};

export const ThreeSceneComp = React.memo(ThreeScene);
