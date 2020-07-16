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

    const threeCBs = useRef({
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
    });

    useEffect(() => {
        threeCBs.current = {
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

            screenToWorldCoords: (screenX, screenY) =>
                threeScene.screenToWorldCoords(screenX, screenY),

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
        };
    }, [threeScene]);

    //------------------------------------------------------------------------
    //
    // subscribe to controlsPubSub

    useEffect(() => {
        if (!controlsCB || !threeScene) return;

        threeScene.controlsPubSub.subscribe(controlsCB);
    }, [controlsCB, threeScene]);

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

    return (
        <div
            className={classnames(styles.container, styles.noOutline)}
            ref={(elt) => (containerRef.current = elt)}>
            <canvas
                className={classnames(styles.canvas, styles.noOutline)}
                ref={(elt) => (threeCanvasRef.current = elt)}
            />
            <div>{children}</div>

            <div className={styles.noOutline} ref={(elt) => (labelContainerRef.current = elt)} />
            {children}
        </div>
    );
}

// {React.Children.map(children, (el) =>
//                   React.cloneElement(
//                       el,
//                       threeCBs.current ? { threeCBs: threeCBs.current } : { threeCBs: null }
//                   )
//               )}

export const ThreeSceneComp = React.memo(React.forwardRef(ThreeScene));

export function useThreeCBs(threeRef) {
    const [threeCBs, setThreeCBs] = useState(null);

    useEffect(() => {
        if (!threeRef.current) return;

        const getCanvas = () => threeRef.current.getCanvas();

        const getCamera = () => threeRef.current.getCamera();

        const setCameraPosition = (pos, up) => threeRef.current.setCameraPosition(pos, up);

        const setCameraLookAt = (pos) => threeRef.current.setCameraLookAt(pos);

        const getMouseCoords = (e, mesh) => threeRef.current.getMouseCoords(e, mesh);

        // calculates where ray into the screen at (screenX, screenY) intersects mesh
        const screenToWorldCoords = (screenX, screenY) =>
            threeRef.current.screenToWorldCoords(screenX, screenY);

        const add = (m) => threeRef.current.add(m);

        const remove = (m) => threeRef.current.remove(m);

        const render = () => threeRef.current.render();

        const resetControls = () => threeRef.current.resetControls();

        const changeControls = (newControlsData) =>
            threeRef.current.changeControls(newControlsData);

        const getControlsTarget = () => threeRef.current.getControlsTarget();

        const downloadGLTF = (filename) => threeRef.current.downloadGLTF(filename);

        const addLabel = (labelObj) => threeRef.current.addLabel(labelObj);

        const removeLabel = (id) => threeRef.current.removeLabel(id);

        const drawLabels = () => threeRef.current.drawLabels();

        const addDragControls = ({ meshArray, dragCB, dragendCB }) =>
            threeRef.current.addDragControls({ meshArray, dragCB, dragendCB });

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
            downloadGLTF,
            screenToWorldCoords,
            addLabel,
            removeLabel,
            drawLabels,
            addDragControls
        });
    }, [threeRef]);

    return threeCBs;
}