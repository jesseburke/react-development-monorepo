import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Route, Link } from 'wouter';
import { Router as WouterRouter } from 'wouter';

import * as THREE from 'three';

import './styles.css';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.js';
import FreeDrawComp from '../../components/FreeDrawComp.js';
import TranslateComp from '../../components/TranslateComp.js';
import Input from '../../components/Input.js';

import useExpandingMesh from '../../graphics/useExpandingMesh.js';
import useHashLocation from '../../hooks/useHashLocation.js';
import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use2DAxes from '../../graphics/use2DAxes.js';

import gsapTranslate from '../../animations/gsapTranslate.js';

import FullScreenBaseComponent from '../../components/FullScreenBaseComponent';
import Button from '../../components/Button.js';

import { fonts, initAxesData, initGridAndOriginData, initOrthographicData } from './constants.js';

//------------------------------------------------------------------------

// const freeDrawMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ),
// 						       opacity: 1.0,
//                                                        side: THREE.FrontSide});
// const fixedMaterial =  freeDrawMaterial.clone();
// fixedMaterial.opacity = .35;
// fixedMaterial.transparent = true;

const fixedMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});
fixedMaterial.opacity = 0.35;
fixedMaterial.transparent = true;

const translationDuration = 0.4;

const startingTranslation = [2, 1];

const EPSILON = 0.00001;

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});

export default function App() {
    const [, navigate] = useHashLocation();

    // this is only used to define threeCBs (which are used everywhere)
    const threeSceneRef = useRef(null);

    // following is passed to components that draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const [xCurTranslation, setXCurTranslation] = useState(startingTranslation[0]);
    const [yCurTranslation, setYCurTranslation] = useState(startingTranslation[1]);

    const [xTotalTranslation, setXTotalTranslation] = useState(0);
    const [yTotalTranslation, setYTotalTranslation] = useState(0);

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

        setXTotalTranslation(0);
        setYTotalTranslation(0);
        setXCurTranslation(startingTranslation[0]);
        setYCurTranslation(startingTranslation[1]);

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh, navigate]);

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
            gsapTranslate({
                mesh: userMesh.getMesh(),
                delay: 0,
                duration: translationDuration,
                toVec: fixedMesh.getMesh().position,
                renderFunc: threeCBs.render,
                clampToEnd: true,
                onComplete: () => setAnimating(false)
            });
        }

        setXTotalTranslation(0);
        setYTotalTranslation(0);

        navigate('/');
    }, [threeCBs, userMesh, fixedMesh, navigate]);

    const xCurTranslationCB = useCallback((value) => {
        setXCurTranslation(Number(eval(value)));
    }, []);

    const yCurTranslationCB = useCallback((value) => {
        setYCurTranslation(Number(eval(value)));
    }, []);

    const xTotalTranslationCB = useCallback((value) => {
        setXTotalTranslation(Number(eval(value)));
    }, []);

    const yTotalTranslationCB = useCallback((value) => {
        setYTotalTranslation(Number(eval(value)));
    }, []);

    useEffect(() => {
        if (!threeCBs || !userMesh.getMesh()) {
            return;
        }

        //setAnimating(true);

        gsapTranslate({
            mesh: userMesh.getMesh(),
            delay: 0,
            duration: translationDuration,
            toVec: new THREE.Vector3(xTotalTranslation, yTotalTranslation, 0),
            //translateVec: new THREE.Vector3(newVal,yTotalTranslation,0),
            renderFunc: threeCBs.render,
            clampToEnd: false,
            onComplete: () => setAnimating(false)
        });
    }, [threeCBs, userMesh, xTotalTranslation, yTotalTranslation]);

    const translateCB = useCallback(() => {
        if (!userMesh.getMesh() || !threeCBs) return;

        //console.log('translatecb called with xcurtrans = ', xCurTranslation,
        //' and ycurtrans = ', yCurTranslation);

        setAnimating(true);
        setXTotalTranslation((x) => x + xCurTranslation);
        setYTotalTranslation((y) => y + yCurTranslation);

        gsapTranslate({
            mesh: userMesh.getMesh(),
            delay: 0,
            duration: translationDuration,
            translateVec: new THREE.Vector3(xCurTranslation, yCurTranslation, 0),
            renderFunc: threeCBs.render,
            onComplete: () => {
                setAnimating(false);
            }
        });
    }, [userMesh, threeCBs, xCurTranslation, yCurTranslation]);

    return (
        <FullScreenBaseComponent fonts={fonts}>
            <ThreeSceneComp ref={threeSceneRef} initCameraData={cameraData.current} />

            <WouterRouter hook={useHashLocation}>
                <Route path='/'>
                    <FreeDrawComp
                        threeCBs={threeCBs}
                        doneCBs={freeDrawDoneCBs}
                        material={freeDrawMaterial}
                        clearCB={clearCB}
                        transforms={[]}
                        fontSize={'1.25em'}
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
                                <Button onClickFunc={translateCB} active={!animating}>
                                    Translate
                                </Button>
                            </span>
                            <span className='med-margin'> by </span>
                            <span className='med-margin'>
                                <Input
                                    size={2}
                                    initValue={xCurTranslation}
                                    onC={xCurTranslationCB}
                                />
                                ,
                                <Input
                                    size={2}
                                    initValue={yCurTranslation}
                                    onC={yCurTranslationCB}
                                />
                            </span>
                        </div>

                        <div className='med-margin'>
                            <span className='med-margin'>Total translation: </span>
                            <span className='med-margin'>
                                <Input
                                    size={2}
                                    initValue={xTotalTranslation}
                                    onC={xTotalTranslationCB}
                                />
                                <Input
                                    size={2}
                                    initValue={yTotalTranslation}
                                    onC={yTotalTranslationCB}
                                />
                            </span>
                        </div>
                    </div>
                    <TranslateComp
                        resetCB={resetCB}
                        xCurTranslation={xCurTranslation}
                        yCurTranslation={yCurTranslation}
                        threeCBs={threeCBs}
                        animating={animating}
                    />
                </Route>
            </WouterRouter>
        </FullScreenBaseComponent>
    );
}
