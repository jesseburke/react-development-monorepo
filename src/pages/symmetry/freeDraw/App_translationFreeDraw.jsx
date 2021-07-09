import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';

import * as THREE from 'three';

import { ThreeSceneComp, useThreeCBs } from '../../../components/ThreeScene';
import Grid from '../../../ThreeSceneComps/Grid';
import Axes2D from '../../../ThreeSceneComps/Axes2D.jsx';
import ClickablePlaneComp from '../../../ThreeSceneComps/ClickablePlane.jsx';
import CircularArrow from '../../../ThreeSceneComps/CircularArrow';
import FreeDrawComp from '../../../ThreeSceneComps/FreeDraw.jsx';

import Button from '../../../components/ButtonWithActiveState.jsx';

import { Route, Link } from '../../../routing';

import gsapTranslate from '../../../animations/gsapTranslate.jsx';

import {
    boundsData,
    axesData,
    drawingAtom,
    curTranslationAtom,
    totalTranslationAtom,
    CurTranslationComp,
    TotalTranslationComp,
    translatePointData
} from './App_translationFreeDraw_atoms';

const aspectRatio = window.innerWidth / window.innerHeight;

const fixedCameraData = {
    up: [0, 1, 0],
    near: 0.1,
    far: 100,
    aspectRatio,
    orthographic: true
};

const initControlsData = {
    enabled: false
};

const translationDuration = 0.4;

const EPSILON = 0.00001;

const translateBoxCss =
    'absolute top-10 left-10 p-4 flex flex-col justify-between content-between items-center select-none border-black rounded-md border-2';

export default function App() {
    const threeSceneRef = useRef(null);
    const threeCBs = useThreeCBs(threeSceneRef);

    // used for animations
    const meshRef = useRef(null);

    const [animating, setAnimating] = useState(false);
    const setDrawing = useAtom(drawingAtom)[1];

    const [curTranslation, setCurTranslation] = useAtom(curTranslationAtom);
    const [totalTranslation, setTotalTranslation] = useAtom(totalTranslationAtom);

    const resetCB = useCallback(() => {
        setDrawing(true);
        setTotalTranslation({ x: 0, y: 0 });
        setCurTranslation({ x: 2, y: 1 });
    }, []);

    useEffect(() => {
        if (!threeCBs || !meshRef.current) {
            return;
        }

        setAnimating(true);

        gsapTranslate({
            mesh: meshRef.current.mainMesh,
            delay: 0,
            duration: translationDuration,
            toVec: new THREE.Vector3(totalTranslation.x, totalTranslation.y, 0),
            //translateVec: new THREE.Vector3(newVal,yTotalTranslation,0),
            renderFunc: threeCBs.render,
            clampToEnd: false,
            onComplete: () => setAnimating(false)
        });
    }, [threeCBs, totalTranslation]);

    const translateCB = useCallback(() => {
        if (!meshRef.current || !threeCBs) return;

        setAnimating(true);
        setTotalTranslation(({ x, y }) => ({ x: x + curTranslation.x, y: y + curTranslation.y }));

        gsapTranslate({
            mesh: meshRef.current.mainMesh,
            delay: 0,
            duration: translationDuration,
            translateVec: new THREE.Vector3(curTranslation.x, curTranslation.y, 0),
            renderFunc: threeCBs.render,
            onComplete: () => {
                setAnimating(false);
            }
        });
    }, [threeCBs, curTranslation]);

    return (
        <div className='full-screen-base'>
            <ThreeSceneComp
                fixedCameraData={fixedCameraData}
                controlsData={initControlsData}
                ref={threeSceneRef}
            >
                <Axes2D
                    tickDistance={1}
                    boundsAtom={boundsData.atom}
                    axesDataAtom={axesData.atom}
                />
                <Grid boundsAtom={boundsData.atom} gridShow={true} />
                <FreeDrawComp ref={meshRef} transforms={[]} activeAtom={drawingAtom} />
                <ClickablePlaneComp
                    clickPointAtom={translatePointData.atom}
                    pausedAtom={drawingAtom}
                />
            </ThreeSceneComp>
            <Route path='/'>
                <Link href='/not_drawing'>
                    <div className='absolute top-10 left-10'>
                        <Button onClick={() => setDrawing(false)}>Translate Figure</Button>
                    </div>
                </Link>
            </Route>

            <Route path='/not_drawing'>
                <div className={translateBoxCss}>
                    <div className='px-4 py-2 flex justify-around align-baseline'>
                        <span className='m-2'>
                            <Button onClick={translateCB} active={!animating}>
                                Translate
                            </Button>
                        </span>
                        <span className='m-2'> by </span>
                        <CurTranslationComp classNameStr='m-2' />
                    </div>

                    <div className='m-2'>
                        <span className='m-2'>Total translation: </span>
                        <TotalTranslationComp classNameStr='m-2' />
                    </div>
                </div>
                <Link href='/'>
                    <div className='absolute bottom-10 left-6 cursor-pointer'>
                        <Button onClick={resetCB}>Back to drawing</Button>
                    </div>
                </Link>
            </Route>
        </div>
    );
}
