import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import { OptionsTabComp } from '@jesseburke/components';

import { ThreeSceneComp } from '../../ThreeSceneComps/ThreeScene';
import { MainDataComp } from '@jesseburke/data';
import Grid from '../../ThreeSceneComps/Grid';
import Axes3D from '../../ThreeSceneComps/Axes3D.jsx';
import FunctionGraph3D from '../../ThreeSceneComps/FunctionGraph3D';
import CameraControls from '../../ThreeSceneComps/CameraControls.jsx';

import {
    funcData,
    boundsData,
    gridBoundsAtom,
    labelData,
    cameraData,
    axesData,
    atomStoreAtom
} from './App_fg_atoms';

const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    firstPt: '#C2374F',
    secPt: '#C2374F',
    testFunc: '#E16962', //#DBBBB0',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0',
    funcGraph: '#E53935'
};

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.ROTATE },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

const aspectRatio = window.innerWidth / window.innerHeight;

const fixedCameraData = {
    up: [0, 0, 1],
    near: 0.1,
    far: 1000,
    aspectRatio,
    orthographic: false
};

const btnClassStr =
    'absolute left-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 bg-gray-200 cursor-pointer text-lg';

const saveBtnClassStr = btnClassStr + ' bottom-40';

const resetBtnClassStr = btnClassStr + ' bottom-24';

const photoBtnClassStr = btnClassStr + ' bottom-8';

//------------------------------------------------------------------------

export default function App() {
    const DataComp = MainDataComp(atomStoreAtom);

    return (
        <JProvider>
            <div className='full-screen-base'>
                <header
                    className='control-bar bg-persian_blue-900 font-sans
		    p-8 text-white'
                >
                    <funcData.component />
                    <OptionsTabComp
                        className={'w-32 bg-gray-50 text-persian_blue-900 p-2 rounded'}
                        nameComponentArray={[
                            ['Axes', axesData.component],
                            ['Bounds', boundsData.component],
                            ['Camera', cameraData.component],
                            ['Variable labels', labelData.component]
                        ]}
                    />
                </header>

                <main className='flex-grow relative p-0'>
                    <ThreeSceneComp
                        fixedCameraData={fixedCameraData}
                        controlsData={initControlsData}
                        photoButton={true}
                        photoBtnClassStr={photoBtnClassStr}
                    >
                        <Axes3D
                            tickDistance={1}
                            boundsAtom={gridBoundsAtom}
                            axesDataAtom={axesData.atom}
                            labelAtom={labelData.atom}
                        />
                        <Grid boundsAtom={gridBoundsAtom} gridShow={true} />
                        <FunctionGraph3D
                            funcAtom={funcData.funcAtom}
                            boundsAtom={boundsData.atom}
                            color={initColors.funcGraph}
                        />
                        <CameraControls cameraDataAtom={cameraData.atom} />
                    </ThreeSceneComp>
                    <DataComp
                        resetBtnClassStr={resetBtnClassStr}
                        saveBtnClassStr={saveBtnClassStr}
                    />
                </main>
            </div>
        </JProvider>
    );
}
