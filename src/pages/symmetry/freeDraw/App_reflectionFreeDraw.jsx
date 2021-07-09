import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import { ThreeSceneComp, useThreeCBs } from '../../../components/ThreeScene';
import Grid from '../../../ThreeSceneComps/Grid';
import Axes2D from '../../../ThreeSceneComps/Axes2D.jsx';
import Line from '../../../ThreeSceneComps/Line';
import FreeDrawComp from '../../../ThreeSceneComps/FreeDraw.jsx';
import ClickablePlaneComp from '../../../ThreeSceneComps/ClickablePlane.jsx';
import Button from '../../../components/ButtonWithActiveState.jsx';

import { Route, Link } from '../../../routing';

import gsapRotate from '../../../animations/gsapRotate.jsx';
import gsapReflect from '../../../animations/gsapReflect.jsx';

import {
    boundsData,
    axesData,
    linePointAtom,
    lineDataAtom,
    drawingAtom
} from './App_reflectionFreeDraw_atoms';

//------------------------------------------------------------------------

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

const rotationDuration = 0.4;
const reflectionDuration = 0.5;

//------------------------------------------------------------------------

export default function App() {
    const setDrawing = useAtom(drawingAtom)[1];

    const threeSceneRef = useRef(null);
    const meshRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const line = useAtom(lineDataAtom)[0];

    const [animating, setAnimating] = useState(false);

    //------------------------------------------------------------------------

    const resetCB = useCallback(() => {
        setDrawing(true);

        if (!threeCBs || !meshRef.current || !meshRef.current.fixedMesh) return;

        // rotate mesh back to original position
        gsapRotate({
            mesh: meshRef.current.mainMesh,
            delay: 0,
            duration: rotationDuration,
            quaternion: meshRef.current.fixedMesh.quaternion,
            renderFunc: () => threeCBs.render(),
            clampToEnd: true,
            onStart: () => setAnimating(true),
            onComplete: () => setAnimating(false)
        });
    }, [threeCBs, meshRef]);

    const reflectCB = useCallback(() => {
        if (!threeCBs || !meshRef.current || !line) return;

        gsapReflect({
            mesh: meshRef.current.mainMesh,
            axis: line.getDirection(),
            delay: 0,
            renderFunc: () => threeCBs.render(),
            duration: reflectionDuration,
            onStart: () => setAnimating(true),
            onComplete: () => setAnimating(false)
        });
    }, [line, threeCBs, meshRef]);

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
                <Line
                    lineDataAtom={lineDataAtom}
                    notVisibleAtom={drawingAtom}
                    boundsAtom={boundsData.atom}
                />
                <ClickablePlaneComp clickPointAtom={linePointAtom} pausedAtom={drawingAtom} />
            </ThreeSceneComp>

            <Route path='/'>
                <Link href='/not_drawing'>
                    <div className='absolute top-10 left-10'>
                        <Button onClick={() => setDrawing(false)}>Reflect Figure</Button>
                    </div>
                </Link>
            </Route>

            <Route path='/not_drawing'>
                <div
                    className='absolute bottom-5 width-full flex
		    items-end justify-around'
                >
                    <Link href='/'>
                        <div className='cursor-pointer'>
                            <Button onClick={resetCB}>Back to drawing</Button>
                        </div>
                    </Link>

                    <div>Click on plane to choose reflection line</div>

                    <div>
                        <Button onClick={reflectCB} active={!animating}>
                            Reflect!
                        </Button>
                    </div>
                </div>
            </Route>
        </div>
    );
}
