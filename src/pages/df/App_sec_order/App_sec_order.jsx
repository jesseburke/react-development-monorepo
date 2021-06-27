import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import OptionsTabComp from '../../../components/OptionsTabComp';
import { ThreeSceneComp } from '../../../components/ThreeScene';
import MainDataComp from '../../../data/MainDataComp.jsx';
import Grid from '../../../ThreeSceneComps/Grid';
import Axes2D from '../../../ThreeSceneComps/Axes2D.jsx';
import Sphere from '../../../ThreeSceneComps/DraggableSphere.jsx';
import FunctionGraph2D from '../../../ThreeSceneComps/FunctionGraph2D.jsx';

import {
    boundsData,
    labelData,
    solutionCurveData,
    orthoCameraData,
    axesData,
    initialPoint1Data,
    initialPoint2Data,
    InitialPointsInput,
    solnAtom,
    atomStoreAtom,
    SecondOrderInput
} from './App_sec_order_atoms.jsx';

//------------------------------------------------------------------------
//
// initial data
//

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.PAN },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY_PAN },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    zoomSpeed: 2,
    screenSpacePanning: true
};

const aspectRatio = window.innerWidth / window.innerHeight;

const fixedCameraData = {
    up: [0, 1, 0],
    near: 0.1,
    far: 100,
    aspectRatio,
    orthographic: true
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
		    p-4 md:p-8 text-white'
                >
                    <SecondOrderInput />
                    <InitialPointsInput />
                    <OptionsTabComp
                        className={'w-32 bg-gray-50 text-persian_blue-900 p-2 rounded'}
                        nameComponentArray={[
                            ['Axes', axesData.component],
                            ['Bounds', boundsData.component],
                            ['Camera', orthoCameraData.component],
                            ['Solution curve', solutionCurveData.component],
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
                        <Grid boundsAtom={boundsData.atom} gridShow={true} />
                        <Axes2D
                            tickLabelDistance={1}
                            boundsAtom={boundsData.atom}
                            axesDataAtom={axesData.atom}
                            labelAtom={labelData.atom}
                        />
                        <FunctionGraph2D
                            funcAtom={solnAtom}
                            boundsAtom={boundsData.atom}
                            curveOptionsAtom={solutionCurveData.atom}
                        />
                        <Sphere dragPositionAtom={initialPoint1Data.atom} radius={0.25} />
                        <Sphere dragPositionAtom={initialPoint2Data.atom} radius={0.25} />
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
