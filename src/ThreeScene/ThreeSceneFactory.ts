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

export interface ThreeFactoryProps {
    drawCanvas: HTMLCanvasElement;
    labelContainerDiv: HTMLDivElement;
    cameraData: CameraData;
    controlsData: ControlsData;
    clearColor: string;
    alpha: boolean;
}

export default function ThreeSceneFactory({
    drawCanvas,
    labelContainerDiv,
    cameraData,
    clearColor = '#f0f0f0',
    controlsData,
    alpha = true
}: ThreeFactoryProps) {
    let scene: THREE.Scene | null = null;

    let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let raycaster = new THREE.Raycaster();
    let controls: OrbitControls | null = null;

    let coordPlaneMesh: THREE.Mesh | null = null;

    let threeLabelData: LabelProps | null = [];
    let htmlLabelData: (LabelProps | null)[] = [];
    let labelCounter = 0;

    let isOrthoCamera = false;
    let aspectRatio: number | null = null;
    let frustumSize: number | null = null;

    const controlsPubSub = pubsub();

    controlsPubSub.subscribe(drawLabels);

    if (!drawCanvas) {
        console.log('useThree was passed a null drawCanvas, and so returned null');
        return;
    }

    let width = drawCanvas.clientWidth;
    let height = drawCanvas.clientHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: drawCanvas,
        antialias: true,
        alpha
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(clearColor);
    renderer.setSize(width, height, false);

    scene = new THREE.Scene();

    const fov = cameraData.fov || 95;
    const aspect = width! / height!; // the canvas default
    const near = cameraData.near || 0.01;
    const far = cameraData.far || 5000;

    if (!cameraData.orthographic) {
        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    } else {
        isOrthoCamera = true;

        if (!cameraData.aspectRatio) {
            console.log('need to have non-null aspectRatio in cameraData for orthographic camera');
            return;
        }

        if (!cameraData.frustumSize) {
            console.log('need to have non-null frustumSize in cameraData for orthographic camera');
            return;
        }

        aspectRatio = cameraData.aspectRatio!;
        frustumSize = cameraData.frustumSize!;

        camera = new THREE.OrthographicCamera(
            (frustumSize * aspectRatio) / -2,
            (frustumSize * aspectRatio) / 2,
            frustumSize / 2,
            frustumSize / -2,
            near,
            far
        );
    }

    if (cameraData.position) {
        camera.translateX(cameraData.position[0]);
        camera.translateY(cameraData.position[1]);
        camera.translateZ(cameraData.position[2]);
    }

    if (cameraData.up) {
        camera.up = new THREE.Vector3(...cameraData.up);
    }

    const color = 0xffffff;
    let intensity = 0.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1000, 1000, 1000);

    if (!scene || !drawCanvas) return;

    scene.add(light);
    const light1 = new THREE.DirectionalLight(color, intensity);
    light1.position.set(1000, -1000, 1000);
    scene.add(light1);

    intensity = 0.5;
    const light2 = new THREE.AmbientLight(color, intensity);
    scene.add(light2);

    const render = () => {
        if (!renderer || !scene || !camera) {
            console.log('render was called in useThree with null renderer, scene or camera');
            return;
        }

        renderer.render(scene, camera);
    };

    const handleResize = () => {
        if (!drawCanvas) {
            console.log('handleResize called with null drawCanvas');
            return;
        }

        const newWidth = drawCanvas.clientWidth;
        const newHeight = drawCanvas.clientHeight;

        if (width == newWidth && height == newHeight) return;

        aspectRatio = newWidth / newHeight;
        width = newWidth;
        height = newHeight;

        if (!renderer || !camera) {
            console.log('handleResize called with null renderer or null camera');
            return;
        }

        if (!isOrthoCamera) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
        } else {
            renderer.setSize(width, height, false);
            camera.left = (frustumSize * aspectRatio) / -2;
            camera.right = (frustumSize * aspectRatio) / 2;
            camera.top = frustumSize / 2;
            camera.bottom = frustumSize / -2;
        }
        camera.updateProjectionMatrix();

        render();
        drawLabels();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(drawCanvas, { box: 'content-box' });

    drawLabels();
    render();

    // // resize observer effect
    // useEffect(() => {
    //     if (!scene || !drawCanvas) return;

    //     const resizeObserver = new ResizeObserver(handleResize);
    //     resizeObserver.observe(drawCanvas, { box: 'content-box' });

    //     return () => {
    //         if (resizeObserver && drawCanvas) resizeObserver.unobserve(drawCanvas);
    //     };
    // }, []);

    controls = new OrbitControls(camera, drawCanvas);

    // adds all properties of controlsData to controls
    controls = Object.assign(controls, controlsData);
    controls.update();

    controls.addEventListener('change', () => {
        let v = new THREE.Vector3(0, 0, 0);
        camera!.getWorldPosition(v);
        controlsPubSub.publish(v.toArray());
        render();
    });

    const bounds = { xMin: -1000, xMax: 1000, yMax: 1000, yMin: -1000 };

    const { xMin, xMax, yMin, yMax } = bounds;

    const planeGeom = new THREE.PlaneBufferGeometry(xMax - xMin, yMax - yMin, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 'rgba(0, 0, 0, 1)' });

    mat.transparent = true;
    mat.opacity = 0.0;
    mat.side = THREE.DoubleSide;
    //planeGeom.rotateX(Math.PI);

    coordPlaneMesh = new THREE.Mesh(planeGeom, mat);

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
        threeLabelData[labelCounter] = { pos, text, style, anchor };
        labelCounter++;
        return labelCounter;
    }

    function removeLabel(id: number) {
        threeLabelData[id - 1] = null;
    }

    function drawLabels() {
        // remove all previous labels
        if (!labelContainerDiv) {
            console.log('tried to draw labels in useThree with null labelContainerRef');
            return;
        }

        if (!camera) {
            console.log('tried to draw label with null camera in useThree');
            return;
        }

        while (labelContainerDiv.firstChild) {
            labelContainerDiv.removeChild(labelContainerDiv.firstChild);
        }

        htmlLabelData = [];

        // following converts all coordinates of labels to html coordinates;
        // if they are in the window, they are added to htmlLabelData
        let x, y;

        for (let key in threeLabelData) {
            if (!threeLabelData[key] || !threeLabelData[key]!.pos) {
                continue;
            }

            [x, y] = threeToHtmlCoords(
                threeLabelData[key].pos,
                camera.matrixWorldInverse,
                camera.projectionMatrix
            );

            if (0 < x && x < width && 0 < y && y < height) {
                htmlLabelData[key] = {};
                htmlLabelData[key].text = threeLabelData[key].text;
                htmlLabelData[key].style = threeLabelData[key].style;
                htmlLabelData[key].pos = [x, y];
                htmlLabelData[key].anchor = threeLabelData[key].anchor;
            }
        }

        let workingDiv;
        let labelClass;
        let curStyleString;
        let anchor;

        for (let key in htmlLabelData) {
            workingDiv = document.createElement('div');
            workingDiv.textContent = htmlLabelData[key].text;

            curStyleString = htmlLabelData[key].style;
            anchor = htmlLabelData[key].anchor;

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
                        left: ${htmlLabelData[key].pos[0]}px;
                        top: ${htmlLabelData[key].pos[1]}px;
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
                        right: ${width - htmlLabelData[key].pos[0]}px;
                        top: ${htmlLabelData[key].pos[1]}px;
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
                        right: ${width - htmlLabelData[key].pos[0]}px;
                        top: ${htmlLabelData[key].pos[1]}px;
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
                        right: ${width - htmlLabelData[key].pos[0]}px;
                        bottom: ${height - htmlLabelData[key].pos[1]}px;
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
                        left: ${htmlLabelData[key].pos[0]}px;
                        bottom: ${htmlLabelData[key].pos[1]}px;
                        font-size: ${curStyleString.fontSize};
                    `;
                    break;
            }

            workingDiv.classList.add(labelClass);

            labelContainerDiv.appendChild(workingDiv);
        }
    }

    // coord = array with three elts, e.g., coord = [1, 2, 1]
    function threeToHtmlCoords(coord: ArrayPoint3) {
        //camera.
        camera.updateProjectionMatrix();

        let temp = new THREE.Vector3(coord[0], coord[1], coord[2]);
        temp.project(camera);

        width = drawCanvas.clientWidth;
        height = drawCanvas.clientHeight;

        const x = (temp.x * 0.5 + 0.5) * width;
        const y = (temp.y * -0.5 + 0.5) * height;
        return [x, y];
    }

    function add(threeObj) {
        if (!scene) return;

        scene.add(threeObj);
        render();
    }

    function remove(threeObj) {
        if (!scene) return;

        scene.remove(threeObj);
    }

    function setCameraPosition(newPosition: ArrayPoint3, newUp: ArrayPoint3 = [0, 0, 1]) {
        camera.position.set(...newPosition);
        camera.quaternion.set(new THREE.Quaternion(0, 0, 0, 1));
        camera.up = new THREE.Vector3(...newUp);
        camera.lookAt(0, 0, 0);

        render();
        camera.updateProjectionMatrix();

        drawLabels();
        render();
    }

    function setCameraLookAt(newPos: ArrayPoint3) {
        camera.lookAt(...newPos);

        //console.log('camera has been positioned in threeScene.setcameraposition');

        render();
        camera.updateProjectionMatrix();

        drawLabels();
        render();
        //console.log('threeScene.setcameraposition over');
    }

    function exportGLTF(onCompleted, options) {
        // const exporter = new GLTFExporter();
        // exporter.parse(scene, onCompleted, options);
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
        renderer.render(scene, camera, null, false);

        const dataURL = renderer.domElement.toDataURL('image/png');

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
        return camera;
    }

    // this assumes that the canvas is the entire width of window, and
    // that the botto of the canvas is the botto of the window
    function getMouseCoords(e, mesh: THREE.Mesh) {
        const xperc = e.clientX / drawCanvas.clientWidth;

        // following accounts for top of canvas being potentially
        // different from top of window
        //
        // e.clientY is in terms of the entire window; we want to see
        // how high the canvas is from the top of the window and subtract that.
        // offsetParent gives the closest positioned ancestor element.
        // in this case, the parent of the canvas is the container
        // div, and this is contained in the main component, which is what we want
        const yperc =
            (e.clientY - drawCanvas.offsetParent.offsetParent.offsetTop) / drawCanvas.clientHeight;

        // normalized device coordinates, both in [-1,1]
        const ncoords = new THREE.Vector2(2 * xperc - 1, -2 * yperc + 1);

        raycaster.setFromCamera(ncoords, camera);

        const array = raycaster.intersectObject(mesh);
        return array[0].point;
    }

    // calculates where ray into the screen at (screenX, screenY) intersects mesh
    function screenToWorldCoords(screenX: number, screenY: number) {
        if (!coordPlaneMesh) return;

        //const xperc = screenX/ drawCanvas.clientWidth;
        // following accounts for fact that canvas might not be entire window
        //const yperc = (screenY - drawCanvas.offsetParent.offsetTop)/ drawCanvas.clientHeight;
        //const ncoords = [xperc*2 - 1, yperc*2 - 1];

        raycaster.setFromCamera(new THREE.Vector2(screenX, screenY), camera);

        const array = raycaster.intersectObject(coordPlaneMesh);
        return array[0].point;
    }

    function resetControls() {
        controls.reset();
        controls.update();

        // should also reset camera?
    }

    function changeControls(newControlsData: ControlsData) {
        controls = Object.assign(controls, newControlsData);

        controls.update();
    }

    // dragendCB is called with the object that is being dragged as first argument
    function addDragControls({ meshArray, dragCB = null, dragDelay, dragendCB = null }) {
        const controls = new DragControls(meshArray, camera, renderer.domElement);
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
        const controls = new DragControls([mesh], camera, renderer.domElement);
        controls.addEventListener('drag', render);

        if (dragCB) {
            controls.addEventListener('drag', dragCB);
        }

        if (dragendCB) {
            controls.addEventListener('dragend', dragendCB, dragendCB);
        }

        return controls.dispose;
    }

    const getControlsTarget = () => controls.target;

    const getCanvas = () => drawCanvas;

    const cleanUp = () => {
        if (resizeObserver && drawCanvas) resizeObserver.unobserve(drawCanvas);

        if (renderer) renderer.renderLists.dispose();

        if (labelContainerDiv) {
            while (labelContainerDiv.firstChild) {
                labelContainerDiv.removeChild(labelContainerDiv.firstChild);
            }
        }

        if (controls) controls.dispose();

        if (planeGeom) planeGeom.dispose();
    };

    return {
        add,
        remove,
        render,
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
        controlsPubSub,
        addDragControls,
        addDrag,
        getCanvas,
        cleanUp
    };
}
