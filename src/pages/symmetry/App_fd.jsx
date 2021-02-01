import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Route, Link } from 'wouter';
import { Router as WouterRouter } from 'wouter';

import * as THREE from 'three';

import './styles.css';

import useHashLocation from '../../hooks/useHashLocation.jsx';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.js';
import FreeDrawComp from '../../components/FreeDrawComp.jsx';
import ClickablePlaneComp from '../../components/ClickablePlaneComp.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import Button from '../../components/Button.jsx';

import LineFactory from '../../factories/LineFactory.jsx';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.jsx';
import use2DAxes from '../../graphics/use2DAxes.jsx';
import useExpandingMesh from '../../graphics/useExpandingMesh.jsx';

import gsapRotate from '../../animations/gsapRotate.jsx';
import gsapReflect from '../../animations/gsapReflect.jsx';

import { fonts, initAxesData, initGridAndOriginData, initOrthographicData } from './constants.jsx';

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

            <FreeDrawComp
                threeCBs={threeCBs}
                doneCBs={freeDrawDoneCBs}
                clearCB={clearCB}
                material={freeDrawMaterial}
                fontSize={'1.25em'}
                transforms={[]}
            />
        </FullScreenBaseComponent>
    );
}
