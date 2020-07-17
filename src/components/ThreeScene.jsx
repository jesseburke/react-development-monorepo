import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

import classnames from 'classnames';

import styles from './ThreeScene.module.css';

import useThreeScene from '../graphics/useThree.jsx';

//------------------------------------------------------------------------
//

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
        height = '100%',
        width = '100%',
        clearColor = '#f0f0f0',
        children
    },
    ref
) {
    const containerRef = useRef(null);
    const threeCanvasRef = useRef(null);
    const labelContainerRef = useRef(null);

    const [threeScene, setThreeScene] = useState(
        useThreeScene({
            canvasRef: threeCanvasRef,
            labelContainerRef,
            cameraData: initCameraData,
            controlsData,
            clearColor,
            scrollCB
        })
    );

    // object to be passed to graphic component children; contains methods, e.g., add, remove, etc.
    // only slightly different than threeScene
    const [threeCBs, setThreeCBs] = useState(null);

    // functions to be called in parent component
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
            getCanvas: () => threeCanvasRef.current
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

    return (
        <div
            className={classnames(styles.container, styles.noOutline)}
            ref={(elt) => (containerRef.current = elt)}
        >
            <canvas
                className={classnames(styles.canvas, styles.noOutline)}
                ref={(elt) => (threeCanvasRef.current = elt)}
            />
            <div>{React.Children.map(children, (el) => React.cloneElement(el, { threeCBs }))}</div>
            <div className={styles.noOutline} ref={(elt) => (labelContainerRef.current = elt)} />
        </div>
    );
}

export const ThreeSceneComp = React.memo(React.forwardRef(ThreeScene));

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
