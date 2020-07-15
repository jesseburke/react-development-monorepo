import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Route, Link } from 'wouter';
import { Router as WouterRouter } from 'wouter';

import * as THREE from 'three';

import './styles.css';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.jsx';
import FreeDrawComp from '../../components/FreeDrawComp.jsx';
import RotateComp from '../../components/RotateComp.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';

import useHashLocation from '../../hooks/useHashLocation.jsx';

import useExpandingMesh from '../../graphics/useExpandingMesh.jsx';
import useGridAndOrigin from '../../graphics/useGridAndOrigin.jsx';
import use2DAxes from '../../graphics/use2DAxes.jsx';

import gsapRotate from '../../animations/gsapRotate.jsx';

import { fonts, initAxesData, initGridAndOriginData, initOrthographicData } from './constants.jsx';

//------------------------------------------------------------------------

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});
const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = 0.35;
fixedMaterial.transparent = true;

const rotationDuration = 0.4;

const startingAngle = 30;

const degToRad = (deg) => deg * 0.0174533;

const EPSILON = 0.00001;

export default function App() {
    const [, navigate] = useHashLocation();

    // this is only used to define threeCBs (which are used everywhere)
    const threeSceneRef = useRef(null);

    // following is passed to components that draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const [curAngle, setCurAngle] = useState(degToRad(startingAngle));
    const [totalRotation, setTotalRotation] = useState(0.0);

    const [animating, setAnimating] = useState(false);

    // the animation timeline
    const [timeLine, setTimeLine] = useState(null);

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

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh]);

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
                onComplete: () => {
                    setAnimating(false);
                }
            });
        }

        setTotalRotation(0);
        setCurAngle(degToRad(startingAngle));

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh]);

    const curAngleCB = useCallback((value) => {
        setCurAngle(degToRad(normalizeAngleDeg(eval(value))));
    }, []);

    const totalRotationCB = useCallback(
        (value) => {
            const newAngle = degToRad(normalizeAngleDeg(value));

            const delta = newAngle - totalRotation;

            // this is so same number of hooks are called,
            // because gsapRotate is not calling the onComplete function if
            // delta is too small
            if (Math.abs((delta % 2) * Math.PI) < EPSILON) {
                setAnimating(false);
                setTotalRotation((t) => t);
                setAnimating(false);
                return;
            }

            setAnimating(true);
            setTotalRotation(newAngle);

            gsapRotate({
                mesh: userMesh.getMesh(),
                delay: 0,
                duration: rotationDuration,
                angle: delta,
                renderFunc: threeCBs.render,
                clampToEnd: true,
                onComplete: () => {
                    setAnimating(false);
                }
            });
        },
        [userMesh]
    );

    const rotateCB = useCallback(() => {
        if (!userMesh.getMesh() || !threeCBs) {
            setAnimating(false);
            setTotalRotation((t) => t);
            setAnimating(false);
            return;
        }

        setAnimating(true);
        setTotalRotation((t) => (t + curAngle) % (2 * Math.PI));

        gsapRotate({
            mesh: userMesh.getMesh(),
            delay: 0,
            duration: rotationDuration,
            angle: curAngle,
            renderFunc: threeCBs.render,
            clampToEnd: true,
            onComplete: () => {
                setAnimating(false);
            }
        });
    }, [userMesh, threeCBs, curAngle]);

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
                        transforms={[]}
                    />
                    <Link href='/not_drawing'>
                        <div className='done-link'>
                            <Button>Done drawing</Button>
                        </div>
                    </Link>
                </Route>

                <Route path='/not_drawing'>
                    <div className='reflection-box'>
                        <div className='top-line-reflection-box'>
                            <span className='med-margin'>
                                <Button onClickFunc={rotateCB} active={!animating}>
                                    Rotate
                                </Button>
                            </span>
                            <span className='med-margin'> by </span>
                            <span className='med-margin'>
                                <Input
                                    size={4}
                                    initValue={round(radToDeg(curAngle), 2)}
                                    onC={curAngleCB}
                                />
                                {`\u{00B0}`}
                            </span>
                        </div>

                        <div className='med-margin'>
                            <span className='med-margin'>Total rotation: </span>
                            <Input
                                size={4}
                                initValue={round(radToDeg(totalRotation), 2)}
                                onC={totalRotationCB}
                            />
                            {`\u{00B0}`}
                        </div>
                    </div>
                    <RotateComp
                        curAngle={curAngle}
                        resetCB={resetCB}
                        threeCBs={threeCBs}
                        animating={animating}
                    />
                </Route>
            </WouterRouter>
        </FullScreenBaseComponent>
    );
}

function normalizeAngleDeg(angle) {
    const newAngle = angle % 360;

    if (newAngle > 180) {
        return newAngle - 360;
    } else if (newAngle < -180) {
        return newAngle + 360;
    }

    return newAngle;
}

const radToDeg = (rad) => rad * 57.2958;

function round(x, n = 3) {
    // x = -2.336596841557143

    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}
