import React, { useState, useRef, useEffect, useLayoutEffect, RefObject } from 'react';
import * as THREE from 'three';
//import {OrbitControls} from 'three-orbitcontrols';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//import { GeometryUtils } from 'three/examples/jsm/utils/GeometryUtils.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
//import GLTFExporter from 'three-gltf-exporter';

import { css } from 'emotion';

import { pubsub } from '../utils/BaseUtils';
import { CameraData, LabelStyle, LabelProps, ArrayPoint3 } from '../my-types';

export interface MouseButtons {
    LEFT: THREE.MOUSE;
}

export interface Touches {
    ONE: THREE.TOUCH | THREE.MOUSE;
    TW0: THREE.TOUCH | THREE.MOUSE;
    THREE: THREE.TOUCH | THREE.MOUSE;
}

export interface ControlsData {
    mouseButtons: MouseButtons;
    touches: Touches;
    enableRotate: boolean;
    enablePan: boolean;
    enabled: boolean;
    keyPanSpeed: number;
    screenSpaceSpanning: boolean;
}

export interface UseThreeProps {
    canvasRef: RefObject<HTMLCanvasElement>;
    labelContainerRef: RefObject<HTMLDivElement>;
    cameraData: CameraData;
    controlsData: ControlsData;
    clearColor: string;
    alpha: boolean;
}

export default function useThreeScene({
    canvasRef,
    labelContainerRef,
    cameraData,
    clearColor = '#f0f0f0',
    controlsData,
    alpha = true
}: UseThreeProps) {
    const scene = useRef<THREE.Scene | null>(null);

    const camera = useRef<(THREE.PerspectiveCamera | THREE.OrthographicCamera) | null>(null);
    const renderer = useRef<THREE.WebGLRenderer | null>(null);
    const raycaster = useRef(new THREE.Raycaster());
    const controls = useRef<OrbitControls | null>(null);

    const coordPlaneMesh = useRef<THREE.Mesh | null>(null);

    const threeLabelData = useRef<(LabelProps | null)[]>([]);
    const htmlLabelData = useRef<(LabelProps | null)[]>([]);
    const labelCounter = useRef(0);

    const width = useRef<number | null>(null);
    const height = useRef<number | null>(null);

    const isOrthoCamera = useRef<boolean | null>(null);
    const aspectRatio = useRef<number | null>(null);
    const frustrumSize = useRef<number | null>(null);

    const controlsPubSub = useRef(pubsub(), []);

    controlsPubSub.current.subscribe(drawLabels);

    // initial three setup effect
    useLayoutEffect(() => {
        // set up renderer and scene
        if (!canvasRef.current) {
            console.log('useThree was passed a null canvasRef, and so returned null');
            return;
        }

        width.current = canvasRef.current.clientWidth;
        height.current = canvasRef.current.clientHeight;

        renderer.current = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha
        });
        renderer.current.setPixelRatio(window.devicePixelRatio);
        renderer.current.setClearColor(clearColor);
        renderer.current.setSize(width.current, height.current, false);

        scene.current = new THREE.Scene();
    }, [canvasRef]);

    useEffect(() => {
        // set up camera
        const fov = cameraData.fov || 95;
        const aspect = width.current! / height.current!; // the canvas default
        const near = cameraData.near || 0.01;
        const far = cameraData.far || 5000;

        if (!cameraData.orthographic) {
            camera.current = new THREE.PerspectiveCamera(fov, aspect, near, far);
        } else {
            isOrthoCamera.current = true;

            if (!cameraData.aspectRatio) {
                console.log(
                    'need to have non-null aspectRatio in cameraData for orthographic camera'
                );
                return;
            }

            if (!cameraData.frustrumSize) {
                console.log(
                    'need to have non-null frustrumSize in cameraData for orthographic camera'
                );
                return;
            }

            aspectRatio.current = cameraData.aspectRatio!;
            frustrumSize.current = cameraData.frustrumSize!;

            camera.current = new THREE.OrthographicCamera(
                (frustrumSize.current * aspectRatio.current) / -2,
                (frustrumSize.current * aspectRatio.current) / 2,
                frustrumSize.current / 2,
                frustrumSize.current / -2,
                near,
                far
            );
        }

        if (cameraData.position) {
            camera.current.translateX(cameraData.position[0]);
            camera.current.translateY(cameraData.position[1]);
            camera.current.translateZ(cameraData.position[2]);
        }

        if (cameraData.up) {
            camera.current.up = new THREE.Vector3(...cameraData.up);
        }
    }, [cameraData]);

    // set up lighting
    useEffect(() => {
        const color = 0xffffff;
        let intensity = 0.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1000, 1000, 1000);

        if (!scene.current || !canvasRef.current) return;

        scene.current.add(light);
        const light1 = new THREE.DirectionalLight(color, intensity);
        light1.position.set(1000, -1000, 1000);
        scene.current.add(light1);

        intensity = 0.5;
        const light2 = new THREE.AmbientLight(color, intensity);
        scene.current.add(light2);

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(canvasRef.current, { box: 'content-box' });

        drawLabels();
        render();

        return () => {
            if (resizeObserver && canvasRef.current) resizeObserver.unobserve(canvasRef.current);

            if (renderer.current) renderer.current.renderLists.dispose();

            // not sure why this is here
            if (labelContainerRef.current) {
                while (labelContainerRef.current.firstChild) {
                    labelContainerRef.current.removeChild(labelContainerRef.current.firstChild);
                }
            }
        };
    }, [cameraData]);

    // resize observer effect
    useEffect(() => {
        if (!scene.current || !canvasRef.current) return;

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(canvasRef.current, { box: 'content-box' });

        return () => {
            if (resizeObserver && canvasRef.current) resizeObserver.unobserve(canvasRef.current);
        };
    }, []);

    // controls effect
    useEffect(() => {
        if (!camera.current) {
            console.log('tried to set up controls with a null camera in useThree, returning');
            return;
        }

        if (!canvasRef.current) {
            console.log('tried to set up controls with a null canvasRef in useThree, returning');
            return;
        }

        controls.current = new OrbitControls(camera.current, canvasRef.current);

        // adds all properties of controlsData to controls.current
        controls.current = Object.assign(controls.current, controlsData);
        controls.current.update();

        controls.current.addEventListener('change', () => {
            let v = new THREE.Vector3(0, 0, 0);
            camera.current!.getWorldPosition(v);
            controlsPubSub.current.publish(v.toArray());
            render();
        });

        return () => {
            if (controls.current) controls.current.dispose();
        };
    }, [canvasRef, camera, controlsData]);

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

        return () => {
            planeGeom.dispose();
        };
    }, []);

    //let count = 0;

    const render = () => {
        if (!renderer.current || !scene.current || !camera.current) {
            console.log('render was called in useThree with null renderer, scene or camera');
            return;
        }

        renderer.current.render(scene.current, camera.current);
    };

    const handleResize = () => {
        if (!canvasRef.current) {
            console.log('handleResize called with null canvasRef.current');
            return;
        }

        const newWidth = canvasRef.current.clientWidth;
        const newHeight = canvasRef.current.clientHeight;

        if (width.current == newWidth && height.current == newHeight) return;

        aspectRatio.current = newWidth / newHeight;
        width.current = newWidth;
        height.current = newHeight;

        if (!renderer.current || !camera.current) {
            console.log('handleResize called with null renderer.current or null camera.current');
            return;
        }

        if (!isOrthoCamera) {
            renderer.current.setSize(width.current, height.current, false);
            camera.current.aspect = width.current / height.current;
        } else {
            renderer.current.setSize(width.current, height.current, false);
            camera.current.left = (frustrumSize.current * aspectRatio.current) / -2;
            camera.current.right = (frustrumSize.current * aspectRatio.current) / 2;
            camera.current.top = frustrumSize.current / 2;
            camera.current.bottom = frustrumSize.current / -2;
        }
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
    }: LabelProps) {
        threeLabelData.current[labelCounter.current] = { pos, text, style, anchor };
        labelCounter.current++;
        return labelCounter.current;
    }

    function removeLabel(id: number) {
        threeLabelData.current[id - 1] = null;
    }

    function drawLabels() {
        // remove all previous labels
        if (!labelContainerRef.current) {
            console.log('tried to draw labels in useThree with null labelContainerRef');
            return;
        }

        if (!camera.current) {
            console.log('tried to draw label with null camera in useThree');
            return;
        }

        while (labelContainerRef.current.firstChild) {
            labelContainerRef.current.removeChild(labelContainerRef.current.firstChild);
        }

        htmlLabelData.current = [];

        // following converts all coordinates of labels to html coordinates;
        // if they are in the window, they are added to htmlLabelData
        let x, y;

        for (let key in threeLabelData.current) {
            if (!threeLabelData.current[key] || !threeLabelData.current[key]!.pos) {
                continue;
            }

            [x, y] = threeToHtmlCoords(
                threeLabelData.current[key].pos,
                camera.current.matrixWorldInverse,
                camera.current.projectionMatrix
            );

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
                        pointer-events: none;
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
    function threeToHtmlCoords(coord: ArrayPoint3) {
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
        if (!scene.current) return;

        scene.current.add(threeObj);
    }

    function remove(threeObj) {
        if (!scene.current) return;

        scene.current.remove(threeObj);
    }

    function setCameraPosition(newPosition: ArrayPoint3, newUp: ArrayPoint3 = [0, 0, 1]) {
        camera.current.position.set(...newPosition);
        camera.current.quaternion.set(new THREE.Quaternion(0, 0, 0, 1));
        camera.current.up = new THREE.Vector3(...newUp);
        camera.current.lookAt(0, 0, 0);

        render();
        camera.current.updateProjectionMatrix();

        drawLabels();
        render();
    }

    function setCameraLookAt(newPos: ArrayPoint3) {
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

    // following is from:
    // https://discourse.threejs.org/t/what-is-the-alternative-to-take-high-resolution-picture-rather-than-take-canvas-screenshot/3209
    function downloadPicture() {
        renderer.current.render(scene.current, camera.current, null, false);

        const dataURL = renderer.current.domElement.toDataURL('image/png');

        // save
        saveDataURI(defaultFileName('.png'), dataURL);

        // reset to old dimensions (cheat version)
        handleResize();
    }

    function dataURIToBlob(dataURI) {
        const binStr = window.atob(dataURI.split(',')[1]);
        const len = binStr.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }
        return new window.Blob([arr]);
    }

    function saveDataURI(name, dataURI) {
        const blob = dataURIToBlob(dataURI);

        // force download
        const link = document.createElement('a');
        link.download = name;
        link.href = window.URL.createObjectURL(blob);
        link.onclick = () => {
            window.setTimeout(() => {
                window.URL.revokeObjectURL(blob);
                link.removeAttribute('href');
            }, 500);
        };
        link.click();
    }

    function defaultFileName(ext) {
        const str = `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}${ext}`;
        return str.replace(/\//g, '-').replace(/:/g, '.');
    }

    function getCamera() {
        return camera.current;
    }

    // this assumes that the canvas is the entire width of window, and
    // that the botto of the canvas is the botto of the window
    function getMouseCoords(e, mesh: THREE.Mesh) {
        const xperc = e.clientX / canvasRef.current.clientWidth;

        // following accounts for top of canvas being potentially
        // different from top of window
        //
        // e.clientY is in terms of the entire window; we want to see
        // how high the canvas is from the top of the window and subtract that.
        // offsetParent gives the closest positioned ancestor element.
        // in this case, the parent of the canvas is the container
        // div, and this is contained in the main component, which is what we want
        const yperc =
            (e.clientY - canvasRef.current.offsetParent.offsetParent.offsetTop) /
            canvasRef.current.clientHeight;

        // normalized device coordinates, both in [-1,1]
        const ncoords = new THREE.Vector2(2 * xperc - 1, -2 * yperc + 1);

        raycaster.current.setFromCamera(ncoords, camera.current);

        const array = raycaster.current.intersectObject(mesh);
        return array[0].point;
    }

    // calculates where ray into the screen at (screenX, screenY) intersects mesh
    function screenToWorldCoords(screenX: number, screenY: number) {
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

    function changeControls(newControlsData: ControlsData) {
        controls.current = Object.assign(controls.current, newControlsData);

        controls.current.update();
    }

    // dragendCB is called with the object that is being dragged as first argument
    function addDragControls({ meshArray, dragCB = null, dragDelay, dragendCB = null }) {
        const controls = new DragControls(meshArray, camera.current, renderer.current.domElement);
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

    // dragCB is called with one argument, event, and event.object is the mesh that is being dragged
    function addDrag({ mesh, dragCB = null, dragendCB = null }) {
        const controls = new DragControls([mesh], camera.current, renderer.current.domElement);
        controls.addEventListener('drag', render);

        if (dragCB) {
            controls.addEventListener('drag', dragCB);
        }

        if (dragendCB) {
            controls.addEventListener('dragend', dragendCB, dragendCB);
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
        downloadPicture,
        getCamera,
        screenToWorldCoords,
        getMouseCoords,
        resetControls,
        changeControls,
        getControlsTarget,
        addDragControls,
        addDrag
    };
}