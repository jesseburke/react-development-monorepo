import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Redirect, Switch, Route, Link, useRoute } from 'wouter';
import { Router as WouterRouter } from 'wouter';

import { jsx } from '@emotion/core';
import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import useHashLocation from '../../hooks/useHashLocation.js';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.js';
import FreeDrawComp from '../../components/FreeDrawComp.js';
import ClickablePlaneComp from '../../components/ClickablePlaneComp.js';
import { FullScreenBaseComponent } from '@jesseburke/basic-react-components';
import Button from '../../components/Button.js';

import LineFactory from '../../factories/LineFactory.js';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use2DAxes from '../../graphics/use2DAxes.js';
import useExpandingMesh from '../../graphics/useExpandingMesh.js';

import gsapRotate from '../../animations/gsapRotate.js';
import gsapReflect from '../../animations/gsapReflect.js';

import {
    fonts,
    halfXSize,
    halfYSize,
    initColors,
    initAxesData,
    initGridAndOriginData,
    labelStyle,
    initOrthographicData
} from './constants.js';

//------------------------------------------------------------------------

const reflectionLineColor = 'rgb(231, 71, 41)';
const reflectionLineMaterial = new THREE.MeshBasicMaterial({
    color: reflectionLineColor
});
const reflectionLineRadius = 0.1;

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = 0.35;
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
    }, [threeCBs, userMesh, fixedMesh, lineMesh]);

    const freeDrawDoneCBs = [
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
    }, [threeCBs, line]);

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
                onStart: () => setAnimating(true),
                onComplete: () => setAnimating(false)
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
        if (!userMesh || !line || !threeCBs) return;

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
                    <FreeDrawComp
                        threeCBs={threeCBs}
                        doneCBs={freeDrawDoneCBs}
                        clearCB={clearCB}
                        material={freeDrawMaterial}
                        fontSize={'1.25em'}
                        transforms={[]}
                    />
                    <Link href='/not_drawing'>
                        <div
                            css={{
                                position: 'absolute',
                                top: '10%',
                                left: '10%',
                                fontSize: '1.25em'
                            }}>
                            <Button>Done drawing</Button>
                        </div>
                    </Link>
                </Route>

                <Route path='/not_drawing'>
                    <ClickablePlaneComp threeCBs={threeCBs} clickCB={clickCB} paused={animating} />
                    <div
                        css={{
                            position: 'absolute',
                            bottom: '5%',
                            width: '100%',
                            fontSize: '1.25em',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-around'
                        }}>
                        <div css={{ cursor: 'pointer' }}>
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
