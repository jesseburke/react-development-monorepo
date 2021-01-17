import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import * as THREE from 'three';

import useThreeScene from '../graphics/useThree.jsx';

//------------------------------------------------------------------------
//

const defaultHeightPxs = 1024;

function ThreeScene(
    {
        controlsCB = null,
        scrollCB = null,
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
) {
    const containerRef = useRef(null);
    const threeCanvasRef = useRef(null);
    const labelContainerRef = useRef(null);

    const [threeScene] = useState(
        useThreeScene({
            canvasRef: threeCanvasRef,
            labelContainerRef,
            cameraData: initCameraData,
            controlsData,
            clearColor,
            scrollCB
        })
    );

    const heightPxs = useRef(defaultHeightPxs);
    const widthPxs = useRef(heightPxs.current * aspectRatio);

    // object to be passed to graphic component children; contains methods, e.g., add, remove, etc.
    // only slightly different than threeScene
    const [threeCBs, setThreeCBs] = useState(null);

    // functions to be called in parent component;
    // should be able to be removed after some editing
    React.useImperativeHandle(ref, () => ({
        add: (mesh) => {
            //console.log('threeCBs.add called with mesh = ', mesh);
            threeScene.add(mesh);
            threeScene.render();
        },

        remove: (mesh) => {
            threeScene.remove(mesh);
            threeScene.render();
        },

        render: () => threeScene.render(),

        getCamera: () => threeScene.getCamera(),

        // pos and up are three entry arrays, each representing a point
        setCameraPosition: (pos, up) => {
            //console.log('threeCBs.setcameraposition called with pos = ', pos);
            threeScene.setCameraPosition(pos, up);
        },

        // pos is a three entry array representing a point
        setCameraLookAt: (pos) => {
            threeScene.setCameraLookAt(pos);
        },

        getCanvas: () => threeCanvasRef.current,

        getMouseCoords: (e, mesh) => threeScene.getMouseCoords(e, mesh),

        screenToWorldCoords: (screenX, screenY) => threeScene.screenToWorldCoords(screenX, screenY),

        resetControls: () => threeScene.resetControls(),

        changeControls: (newControlsData) => threeScene.changeControls(newControlsData),

        getControlsTarget: () => threeScene.getControlsTarget(),

        downloadGLTF: (fileName) => threeScene.downloadGLTF(fileName),

        // labelObj = {pos, text, style}
        // pos = array of three numbers
        // test = string
        // style = axesLabelStyle
        //
        // returns id to remove later
        addLabel: (labelObj) => threeScene.addLabel(labelObj),

        removeLabel: (id) => threeScene.removeLabel(id),

        drawLabels: () => threeScene.drawLabels(),

        // dragendCB is called with the object that is being dragged as argument
        addDragControls: ({ meshArray, dragCB, dragendCB }) =>
            threeScene.addDragControls({ meshArray, dragCB, dragendCB })
    }));

    // think these can be gotten rid of...
    useEffect(() => {
        setThreeCBs({
            ...threeScene,
            add: (mesh) => {
                //console.log('threeCBs.add called with mesh = ', mesh);
                threeScene.add(mesh);
                threeScene.render();
            },
            remove: (mesh) => {
                threeScene.remove(mesh);
                threeScene.render();
            },
            getCanvas: () => threeCanvasRef.current,
            getMouseCoords: (e, mesh) => {
                //console.log('new version of getMouseCoords called');
                return threeScene.getMouseCoords(e, mesh);
            },
            // dragendCB is called with the object that is being dragged as argument
            addDragControls: ({ meshArray, dragCB, dragendCB }) =>
                threeScene.addDragControls({ meshArray, dragCB, dragendCB })
        });

        threeScene.render();
    }, [threeScene]);

    //------------------------------------------------------------------------
    //
    // subscribe to controlsPubSub

    useEffect(() => {
        if (!controlsCB || !threeScene) return;

        threeScene.controlsPubSub.subscribe(controlsCB);
    }, [controlsCB, threeScene]);

    //------------------------------------------------------------------------
    //
    // component

    return (
        <div
            className='absolute h-full w-full bg-gray point-events-none'
            ref={(elt) => (containerRef.current = elt)}
        >
            <canvas
                className='h-full w-full block'
                width={widthPxs.current}
                height={heightPxs.current}
                ref={(elt) => (threeCanvasRef.current = elt)}
            />
            <React.Fragment>
                {React.Children.map(children, (el) => React.cloneElement(el, { threeCBs }))}
            </React.Fragment>
            <div ref={(elt) => (labelContainerRef.current = elt)} />
            {showPhotoBtn ? (
                <div className={photoBtnClassStr} onClick={threeScene.downloadPicture}>
                    <button>Photo</button>
                </div>
            ) : null}
        </div>
    );
}

// camera icon
// <span>{'\u{1f4f7}'}</span>

export const ThreeSceneComp = React.memo(React.forwardRef(ThreeScene));

// should get rid of this as soon as possible
export function useThreeCBs(threeRef) {
    const [threeCBs, setThreeCBs] = useState(null);

    useEffect(() => {
        if (!threeRef.current) return;

        const getCanvas = threeRef.current.getCanvas;

        const getCamera = threeRef.current.getCamera;

        const setCameraPosition = threeRef.current.setCameraPosition;

        const setCameraLookAt = threeRef.current.setCameraLookAt;

        const getMouseCoords = threeRef.current.getMouseCoords;

        // calculates where ray into the screen at (screenX, screenY) intersects mesh
        const screenToWorldCoords = threeRef.current.screenToWorldCoords;

        const add = threeRef.current.add;

        const remove = threeRef.current.remove;

        const render = threeRef.current.render;

        const resetControls = threeRef.current.resetControls;

        const changeControls = threeRef.current.changeControls;

        const getControlsTarget = threeRef.current.getControlsTarget;

        const addLabel = threeRef.current.addLabel;

        const removeLabel = threeRef.current.removeLabel;

        const drawLabels = threeRef.current.drawLabels;

        const addDragControls = threeRef.current.addDragControls;

        setThreeCBs({
            getCanvas,
            getCamera,
            setCameraPosition,
            setCameraLookAt,
            getMouseCoords,
            add,
            remove,
            render,
            resetControls,
            changeControls,
            getControlsTarget,
            screenToWorldCoords,
            addLabel,
            removeLabel,
            drawLabels,
            addDragControls
        });
    }, [threeRef]);

    return threeCBs;
}
