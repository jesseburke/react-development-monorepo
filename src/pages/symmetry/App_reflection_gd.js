import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Route, Link } from 'wouter';
import { Router as WouterRouter } from 'wouter';

import * as THREE from 'three';

import './styles.css';

import useHashLocation from '../../hooks/useHashLocation.js';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.js';
import GraphDrawComp from '../../components/GraphDrawComp.js';
import ClickablePlaneComp from '../../components/ClickablePlaneComp.js';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.js';
import Button from '../../components/Button.js';

import LineFactory from '../../factories/LineFactory.js';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use2DAxes from '../../graphics/use2DAxes.js';
import useExpandingMesh from '../../graphics/useExpandingMesh.js';

import gsapRotate from '../../animations/gsapRotate.js';
import gsapReflect from '../../animations/gsapReflect.js';

import { fonts, initAxesData, initGridAndOriginData, initOrthographicData } from './constants.js';

//------------------------------------------------------------------------

const reflectionLineColor = 'rgb(231, 71, 41)';
const reflectionLineMaterial = new THREE.MeshBasicMaterial({ color: reflectionLineColor });
const reflectionLineRadius = 0.05;

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = 0.15;
fixedMaterial.transparent = true;

const rotationDuration = 0.4;
const reflectionDuration = 0.5;

export default function App() {
    const [, navigate] = useHashLocation();

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const [line, setLine] = useState(null);
    const [lineMesh, setLineMesh] = useState(null);

    const [animating, setAnimating] = useState(false);

    const cameraData = useRef(initOrthographicData, []);

    //------------------------------------------------------------------------
    //
    // starting effects

    const userMesh = useExpandingMesh({ threeCBs });
    const fixedMesh = useExpandingMesh({ threeCBs });

    // adds the grid and origin to the ThreeScene
    useGridAndOrigin({ threeCBs, gridData: initGridAndOriginData });
    use2DAxes({ threeCBs, axesData: initAxesData });

    //------------------------------------------------------------------------

    const clearCB = useCallback(() => {
        if (!threeCBs) return;

        if (userMesh) {
            userMesh.clear();
        }

        if (fixedMesh) {
            fixedMesh.clear();
        }

        if (lineMesh) {
            threeCBs.remove(lineMesh);
            lineMesh.geometry.dispose();
        }

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh]);

    const graphDrawDoneCBs = [
        userMesh.expandCB,
        useCallback(
            (mesh) => {
                if (!mesh) return;
                mesh.material = fixedMaterial;
                fixedMesh.expandCB(mesh);
            },
            [fixedMesh]
        )
    ];

    // passed to ClickablePlaneComp
    const clickCB = useCallback((pt) => {
        setLine(LineFactory(pt));
    }, []);

    useEffect(() => {
        if (!threeCBs || !line) {
            setLineMesh(null);
            return;
        }

        const geom = line.makeGeometry({ radius: reflectionLineRadius });
        const mesh = new THREE.Mesh(geom, reflectionLineMaterial);
        setLineMesh(mesh);
        threeCBs.add(mesh);

        return () => {
            threeCBs.remove(mesh);
            geom.dispose();
        };
    }, [line, threeCBs]);

    const resetCB = useCallback(() => {
        if (!threeCBs) return;

        if (userMesh.getMesh()) {
            // rotate mesh back to original position
            gsapRotate({
                mesh: userMesh.getMesh(),
                delay: 0,
                duration: rotationDuration,
                quaternion: fixedMesh.getMesh().quaternion,
                renderFunc: threeCBs.render,
                clampToEnd: true,
                onStart: () => {
                    setAnimating(true);
                },
                onComplete: () => {
                    setAnimating(false);
                }
            });
        }

        if (lineMesh) {
            threeCBs.remove(lineMesh);
            lineMesh.geometry.dispose();
        }

        setLine(null);

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh, lineMesh]);

    const reflectCB = useCallback(() => {
        if (!userMesh.getMesh() || !line || !threeCBs) return;

        gsapReflect({
            mesh: userMesh.getMesh(),
            axis: line.getDirection(),
            delay: 0,
            renderFunc: threeCBs.render,
            duration: reflectionDuration,
            onStart: () => {
                setAnimating(true);
            },
            onComplete: () => {
                setAnimating(false);
            }
        });
    }, [userMesh, line, threeCBs]);

    return (
        <FullScreenBaseComponent fonts={fonts}>
            <ThreeSceneComp ref={threeSceneRef} initCameraData={cameraData.current} />

            <WouterRouter hook={useHashLocation}>
                <Route path='/'>
                    <GraphDrawComp
                        threeCBs={threeCBs}
                        doneCBs={graphDrawDoneCBs}
                        clearCB={clearCB}
                        material={freeDrawMaterial}
                        fontSize='1.25em'
                    />

                    <Link href='/not_drawing'>
                        <div className='done-link'>
                            <Button>Done drawing</Button>
                        </div>
                    </Link>
                </Route>

                <Route path='/not_drawing'>
                    <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} paused={animating} />
                    <div className='bottom-row'>
                        <div className='cursor-pointer'>
                            <Button onClickFunc={resetCB}>Back to drawing</Button>
                        </div>

                        <div>Click on plane to choose reflection line</div>

                        <div>
                            <Button onClickFunc={reflectCB} active={!animating}>
                                Reflect!
                            </Button>
                        </div>
                    </div>
                </Route>
            </WouterRouter>
        </FullScreenBaseComponent>
    );
}
