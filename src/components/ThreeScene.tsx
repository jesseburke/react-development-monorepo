import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useLayoutEffect,
    FunctionComponent
} from 'react';
import * as THREE from 'three';

import ThreeSceneFactory from '../graphics/ThreeSceneFactory';
import { ArrayPoint3 } from '../my-types';

//------------------------------------------------------------------------
//

const defaultHeightPxs = 1024;

export interface ThreeSceneProps {
    controlsCB: (pt: ArrayPoint3) => null;
    initCameraData: null;
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
        showPhotoBtn = true,
        photoBtnClassStr = 'absolute left-6 bottom-6 p-1 border rounded-sm border-solid cursor-pointer text-xl',
        children
    },
    ref
) => {
    const threeCanvasRef = useRef(null);
    const labelContainerRef = useRef(null);

    const [threeScene, setThreeScene] = useState(null);

    useEffect(() => {
        if (!threeCanvasRef.current) {
            setThreeScene(null);
            return;
        }

        setThreeScene(
            ThreeSceneFactory({
                drawCanvas: threeCanvasRef.current,
                labelContainerDiv: labelContainerRef.current,
                cameraData: initCameraData,
                controlsData,
                clearColor
            })
        );
    }, [threeCanvasRef, labelContainerRef, initCameraData, controlsData, clearColor]);

    //------------------------------------------------------------------------
    //
    // subscribe to controlsPubSub

    useEffect(() => {
        if (!controlsCB || !threeScene) return;

        threeScene.controlsPubSub.subscribe(controlsCB);
    }, [controlsCB, threeScene]);

    const heightPxs = useRef(defaultHeightPxs);
    const widthPxs = useRef(heightPxs.current * aspectRatio);

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
            <React.Fragment>
                {React.Children.map(children, (el) =>
                    React.cloneElement(el, { threeCBs: threeScene })
                )}
            </React.Fragment>
            <div ref={(elt) => (labelContainerRef.current = elt)} />
            {showPhotoBtn ? (
                <div onClick={threeScene ? threeScene.downloadPicture : null}>
                    <button className={photoBtnClassStr}>Photo</button>
                </div>
            ) : null}
        </div>
    );
};

export const ThreeSceneComp = React.memo(ThreeScene);
