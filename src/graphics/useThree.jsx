import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
//import {OrbitControls} from 'three-orbitcontrols';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
//import GLTFExporter from 'three-gltf-exporter';

import { throttle } from '../utils/BaseUtils.jsx';

import { css } from 'emotion';

export default function useThreeScene({
    canvasRef,
    labelContainerRef,
    cameraData,
    clearColor = '#f0f0f0',
    controlsData,
    scrollCB = null,
    alpha = true
}) {
    const scene = useRef(null);
    const camera = useRef(null);
    const renderer = useRef(null);
    const controls = useRef(null);
    const raycaster = useRef(new THREE.Raycaster());

    const coordPlaneMesh = useRef(null);

    const threeLabelData = useRef({});
    const htmlLabelData = useRef({});
    const labelCounter = useRef(0);

    const width = useRef(null);
    const height = useRef(null);

    const controlsPubSub = useRef(pubsub(), []);
    controlsPubSub.current.subscribe(drawLabels);

    // initial three setup effect
    useEffect(() => {
        width.current = canvasRef.current.clientWidth;
        height.current = canvasRef.current.clientHeight;

        renderer.current = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha
        });
        renderer.current.setPixelRatio(window.devicePixelRatio);
        renderer.current.setClearColor(clearColor);
        //renderer.current.setClearColor('#ffffff');
        renderer.current.setSize(width.current, height.current, false);

        scene.current = new THREE.Scene();

        const fov = cameraData.fov || 95;
        const aspect = width.current / height.current; // the canvas default
        const near = cameraData.near || 0.01;
        const far = cameraData.far || 5000;

        if (!cameraData.orthographic) {
            camera.current = new THREE.PerspectiveCamera(fov, aspect, near, far);
        } else {
            camera.current = new THREE.OrthographicCamera(
                cameraData.orthographic.left,
                cameraData.orthographic.right,
                cameraData.orthographic.top,
                cameraData.orthographic.bottom,
                near,
                far
            );
        }

        camera.current.translateX(cameraData.position[0]);
        camera.current.translateY(cameraData.position[1]);
        camera.current.translateZ(cameraData.position[2]);

        // the spread operator below, '...', makes the array into the three arguments expected
        camera.current.up = new THREE.Vector3(...cameraData.up);

        const color = 0xffffff;
        let intensity = 0.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1000, 1000, 1000);
        scene.current.add(light);
        const light1 = new THREE.DirectionalLight(color, intensity);
        light1.position.set(1000, -1000, 1000);
        scene.current.add(light1);

        intensity = 0.5;
        const light2 = new THREE.AmbientLight(color, intensity);
        scene.current.add(light2);

        // const light2 = new THREE.DirectionalLight(color, intensity);
        // light2.position.set(1000, 1000, -1000);
        // scene.current.add(light2);
        // const light3 = new THREE.DirectionalLight(color, intensity);
        // light3.position.set(1000, 1000, 1000);
        // scene.current.add(light3);
        // const light4 = new THREE.DirectionalLight(color, intensity);
        // light4.position.set(-1000, -1000, 1000);
        // scene.current.add(light4);
        // const light5 = new THREE.DirectionalLight(color, intensity);
        // light5.position.set(-1000, 1000, -1000);
        // scene.current.add(light5);
        // const light6 = new THREE.DirectionalLight(color, intensity);
        // light6.position.set(1000, -1000, -1000);
        // scene.current.add(light6);
        // const light7 = new THREE.DirectionalLight(color, intensity);
        // light7.position.set(-1000, -1000, -1000);
        // scene.current.add(light7);

        // light.position.set(100, 200, 400);
        // scene.current.add(light);
        // light.position.set(100, -200, 400);
        // scene.current.add(light);
        // light.position.set(-100, -200, 400);
        // scene.current.add(light);

        //const skyColor = 0xB1E1F0;  // light blue
        //const groundColor = 0xB97A20;  // brownish orange
        //const ambIntensity = .75;
        //const ambLight = new THREE.AmbientLight(color, ambIntensity);
        //const ambLight = new THREE.HemisphereLight(skyColor, groundColor, ambIntensity);
        //scene.current.add(ambLight);

        window.onresize = handleResize;

        drawLabels();
        render();

        // cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.current.renderLists.dispose();

            while (labelContainerRef.current.firstChild) {
                labelContainerRef.current.removeChild(labelContainerRef.current.firstChild);
            }
        };
    }, [cameraData]);

    // controls effect
    useEffect(() => {
        controls.current = new OrbitControls(camera.current, canvasRef.current);

        // adds all properties of controlsData to controls.current
        controls.current = Object.assign(controls.current, controlsData);

        controls.current.update();
        controls.current.addEventListener('change', () => {
            render();

            let v = new THREE.Vector3(0, 0, 0);
            camera.current.getWorldPosition(v);
            controlsPubSub.current.publish(v.toArray());
            render();
        });

        // function animate() {

        //     requestAnimationFrame( animate );
        //     controls.current.update();
        //     render();

        //     if( scrollCB ) {

        // 	scrollCB({ xMin: screenToWorldCoords( -1, 0 ).x,
        // 		   xMax: screenToWorldCoords( 1, 0 ).x,
        // 		   xMin: screenToWorldCoords( -1, 0 ).x,
        // 		   xMax: screenToWorldCoords( 1, 0 ).x,

        // 		 });
        //     }

        // };

        // animate();

        return () => {
            controls.current.dispose();
        };
    }, [controlsData]);

    // controls effect
    // useEffect( () => {
    // 	controls.current = new OrbitControls( camera.current, canvasRef.current );

    // 	// adds all properties of controlsData to controls.current
    // 	controls.current = Object.assign( controls.current, controlsData );

    // 	controls.current.update();
    // 	controls.current.addEventListener('change', () => {
    // 	    render();

    // 	    let v = new THREE.Vector3( 0, 0, 0 );
    // 	    camera.current.getWorldPosition(v);
    // 	    controlsPubSub.current.publish(v.toArray());
    // 	    render();
    // 	});

    //     return () => {
    //         controls.current.dispose();
    //     };

    // }, [controlsData] );

    // coordinate plane mesh is created
    useEffect(() => {
        const bounds = { xMin: -1000, xMax: 1000, yMax: 1000, yMin: -1000 };

        const { xMin, xMax, yMin, yMax } = bounds;

        const planeGeom = new THREE.PlaneBufferGeometry(xMax - xMin, yMax - yMin, 1, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 'rgba(0, 0, 0, 1)' });

        mat.transparent = true;
        mat.opacity = 0.0;
        mat.side = THREE.DoubleSide;
        //planeGeom.rotateX(Math.PI);

        coordPlaneMesh.current = new THREE.Mesh(planeGeom, mat);

        //.scene.current.add( coordPlaneMesh.current );

        return () => {
            //scene.current.remove( coordPlaneMesh.current );
            planeGeom.dispose();
        };
    }, []);

    const render = () => {
        renderer.current.render(scene.current, camera.current);
    };

    const handleResize = () => {
        width.current = canvasRef.current.clientWidth;
        height.current = canvasRef.current.clientHeight;
        renderer.current.setSize(width.current, height.current, false);
        camera.current.aspect = width.current / height.current;
        camera.current.updateProjectionMatrix();
        render();
        drawLabels();
    };

    // labelObj = {pos, text, style}
    // pos = array of three numbers
    // test = string
    // style = axesLabelStyle
    function addLabel({
        pos,
        text,
        style = {
            backgroundColor: 'white',
            border: 0,
            color: 'black',
            padding: 0,
            margin: 0,
            fontSize: '1em'
        },
        anchor = 'ul'
    }) {
        threeLabelData.current[labelCounter.current] = { pos, text, style, anchor };
        labelCounter.current++;
        return labelCounter.current;
    }

    function removeLabel(id) {
        threeLabelData.current[id - 1] = null;
    }

    function drawLabels() {
        // remove all previous labels
        while (labelContainerRef.current.firstChild) {
            labelContainerRef.current.removeChild(labelContainerRef.current.firstChild);
        }

        htmlLabelData.current = {};

        // following converts all coordinates of labels to html coordinates;
        // if they are in the window, they are added to htmlLabelData
        let x, y;

        for (let key in threeLabelData.current) {
            if (!threeLabelData.current[key]) {
                continue;
            }

            [x, y] = threeToHtmlCoords({
                coord: threeLabelData.current[key].pos,
                worldInverse: camera.current.matrixWorldInverse,
                projection: camera.current.projectionMatrix
            });

            if (0 < x && x < width.current && 0 < y && y < height.current) {
                htmlLabelData.current[key] = {};
                htmlLabelData.current[key].text = threeLabelData.current[key].text;
                htmlLabelData.current[key].style = threeLabelData.current[key].style;
                htmlLabelData.current[key].pos = [x, y];
                htmlLabelData.current[key].anchor = threeLabelData.current[key].anchor;
            }
        }

        let workingDiv;
        let labelClass;
        let curStyleString;
        let anchor;
        let temp;

        for (let key in htmlLabelData.current) {
            workingDiv = document.createElement('div');
            workingDiv.textContent = htmlLabelData.current[key].text;

            curStyleString = htmlLabelData.current[key].style;
            anchor = htmlLabelData.current[key].anchor;

            switch (anchor) {
                case 'ul':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        left: ${htmlLabelData.current[key].pos[0]}px;
                        top: ${htmlLabelData.current[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;

                case 'ur':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        right: ${width.current - htmlLabelData.current[key].pos[0]}px;
                        top: ${htmlLabelData.current[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;

                case 'mr':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        right: ${width.current - htmlLabelData.current[key].pos[0]}px;
                        top: ${htmlLabelData.current[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;

                case 'lr':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        right: ${width.current - htmlLabelData.current[key].pos[0]}px;
                        bottom: ${height.current - htmlLabelData.current[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;

                case 'll':
                    labelClass = css`
                        background-color: ${curStyleString.backgroundColor};
                        border: ${curStyleString.border};
                        color: ${curStyleString.color};
                        padding: ${curStyleString.padding};
                        position: absolute;
                        margin: 0;
                        user-select: none;
                        left: ${htmlLabelData.current[key].pos[0]}px;
                        bottom: ${htmlLabelData.current[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;
            }

            workingDiv.classList.add(labelClass);

            labelContainerRef.current.appendChild(workingDiv);
        }
    }

    // coord = array with three elts, e.g., coord = [1, 2, 1]
    function threeToHtmlCoords({ coord, worldInverse, projection }) {
        //camera.current.
        camera.current.updateProjectionMatrix();

        let temp = new THREE.Vector3(coord[0], coord[1], coord[2]);
        temp.project(camera.current);

        width.current = canvasRef.current.clientWidth;
        height.current = canvasRef.current.clientHeight;

        const x = (temp.x * 0.5 + 0.5) * width.current;
        const y = (temp.y * -0.5 + 0.5) * height.current;
        return [x, y];
    }

    function add(threeObj) {
        scene.current.add(threeObj);
    }

    function remove(threeObj) {
        scene.current.remove(threeObj);
    }

    // newPosition should be an array of the form [x,y,z]
    //
    function setCameraPosition(newPosition, newUp = [0, 0, 1]) {
        //console.log('threeScene.setcameraposition called with newPosition = ', newPosition);

        //render();
        //const curr = camera.current.position.toArray();
        //let v = new THREE.Vector3( 0, 0, 0 );
        //camera.current.getWorldPosition(v);

        camera.current.position.set(...newPosition);
        camera.current.quaternion.set(new THREE.Quaternion(0, 0, 0, 1));
        camera.current.up = new THREE.Vector3(...newUp);
        camera.current.lookAt(0, 0, 0);

        //console.log('camera has been positioned in threeScene.setcameraposition');

        render();
        camera.current.updateProjectionMatrix();

        drawLabels();
        render();
        //console.log('threeScene.setcameraposition over');
    }

    function setCameraLookAt(newPos) {
        camera.current.lookAt(...newPos);

        //console.log('camera has been positioned in threeScene.setcameraposition');

        render();
        camera.current.updateProjectionMatrix();

        drawLabels();
        render();
        //console.log('threeScene.setcameraposition over');
    }

    function exportGLTF(onCompleted, options) {
        // const exporter = new GLTFExporter();
        // exporter.parse(scene.current, onCompleted, options);
    }

    function downloadGLTF(filename, options) {
        // function callback(gltf) {
        //     const link = document.createElement('a');
        //     link.style.display = 'none';
        //     document.body.appendChild(link);
        //     function save(blob, filename) {
        //         link.href = URL.createObjectURL(blob);
        //         link.download = filename;
        //         link.click();
        //         // URL.revokeObjectURL( url ); breaks Firefox...
        //     }
        //     function saveString(text, filename) {
        //         save(new Blob([text], { type: 'text/plain' }), filename);
        //     }
        //     const output = JSON.stringify(gltf, null, 2);
        //     saveString(output, filename + '.gltf');
        // }
        // exportGLTF(callback, (options = { onlyVisible: false }));
    }

    function getCamera() {
        return camera.current;
    }

    function getMouseCoords(e, mesh) {
        const xperc = e.clientX / canvasRef.current.clientWidth;
        // following accounts for fact that canvas might not be entire window
        const yperc =
            (e.clientY - canvasRef.current.offsetParent.offsetTop) / canvasRef.current.clientHeight;
        const ncoords = [2 * xperc - 1, 1 - 2 * yperc];

        raycaster.current.setFromCamera(new THREE.Vector2(ncoords[0], ncoords[1]), camera.current);

        const array = raycaster.current.intersectObject(mesh);
        return array[0].point;
    }

    // calculates where ray into the screen at (screenX, screenY) intersects mesh
    function screenToWorldCoords(screenX, screenY) {
        if (!coordPlaneMesh.current) return;

        //const xperc = screenX/ canvasRef.current.clientWidth;
        // following accounts for fact that canvas might not be entire window
        //const yperc = (screenY - canvasRef.current.offsetParent.offsetTop)/ canvasRef.current.clientHeight;
        //const ncoords = [xperc*2 - 1, yperc*2 - 1];

        raycaster.current.setFromCamera(new THREE.Vector2(screenX, screenY), camera.current);

        const array = raycaster.current.intersectObject(coordPlaneMesh.current);
        return array[0].point;
    }

    function resetControls() {
        controls.current.reset();
        controls.current.update();

        // should also reset camera?
    }

    function changeControls(newControlsData) {
        controls.current = Object.assign(controls.current, newControlsData);

        controls.current.update();
    }

    // dragendCB is called with the object that is being dragged as first argument
    function addDragControls({ meshArray, dragCB = null, dragDelay, dragendCB = null }) {
        const controls = new DragControls(
            [...meshArray],
            camera.current,
            renderer.current.domElement
        );
        controls.addEventListener('drag', render);

        const idArray = meshArray.map((mesh) => mesh.id);

        // the CB functions expect an index in meshArray; the drag controls passes
        // the mesh itself; this squares those away

        function modifyCB(f) {
            const newFunc = (event) => {
                const index = idArray.indexOf(event.object.id);

                if (index < 0) return null;
                else f(index);
            };

            return newFunc;
        }

        if (dragCB) {
            controls.addEventListener('drag', modifyCB(dragCB));
        }

        if (dragendCB) {
            controls.addEventListener('dragend', modifyCB(dragendCB));
        }

        return controls.dispose;
    }

    const getControlsTarget = () => controls.current.target;

    return {
        add,
        remove,
        render,
        controlsPubSub: controlsPubSub.current,
        addLabel,
        removeLabel,
        drawLabels,
        setCameraPosition,
        setCameraLookAt,
        exportGLTF,
        downloadGLTF,
        getCamera,
        screenToWorldCoords,
        getMouseCoords,
        resetControls,
        changeControls,
        getControlsTarget,
        addDragControls
    };
}

function pubsub() {
    const subscribers = [];
    return {
        subscribe: function (subscriber) {
            subscribers.push(subscriber);
        },
        publish: function (pubObj) {
            subscribers.forEach(function (subscriber) {
                subscriber(pubObj);
            });
        }
    };
}