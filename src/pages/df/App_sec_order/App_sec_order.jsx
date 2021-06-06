import React, { useState, useRef, useEffect, useCallback } from 'react';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import { ThreeSceneComp } from '../../../components/ThreeScene';

import Grid from '../../../ThreeSceneComps/Grid';
import Axes2D from '../../../ThreeSceneComps/Axes2D.jsx';
import Sphere from '../../../ThreeSceneComps/Sphere.jsx';
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
    SolutionDisplayComp,
    DataComp,
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

/* const initControlsData = {
 *     mouseButtons: { LEFT: THREE.MOUSE.PAN },
 *     touches: { ONE: THREE.MOUSE.PAN },
 *     enableRotate: false,
 *     enablePan: true,
 *     enabled: true,
 *     keyPanSpeed: 50,
 *     screenSpaceSpanning: true
 * };
 *  */
const aspectRatio = window.innerWidth / window.innerHeight;

const fixedCameraData = {
    up: [0, 1, 0],
    near: 0.1,
    far: 100,
    aspectRatio,
    orthographic: true
};

const saveBtnClassStr =
    'absolute left-8 bottom-40 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 cursor-pointer text-xl';

const resetBtnClassStr =
    'absolute left-8 bottom-24 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 cursor-pointer text-xl';

const photoBtnClassStr =
    'absolute left-8 bottom-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 cursor-pointer text-xl';

const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    firstPt: '#C2374F',
    secPt: '#C2374F',
    testFunc: '#E16962', //#DBBBB0',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0'
};

//------------------------------------------------------------------------

export default function App() {
    return (
        <JProvider>
            <div className='full-screen-base'>
                <Provider unstable_system={system}>
                    <header
                        className='control-bar bg-persian_blue-900 font-sans
			p-4 md:p-8 text-white'
                    >
                        <SecondOrderInput />
                        <InitialPointsInput />
                        <OptionsModal />
                    </header>

                    <main className='flex-grow relative p-0'>
                        <ThreeSceneComp
                            fixedCameraData={fixedCameraData}
                            controlsData={initControlsData}
                            showPhotoButton={true}
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
                </Provider>
            </div>
        </JProvider>
    );
}

function OptionsModal() {
    const dialog = useDialogState();
    const tab = useTabState();

    useEffect(() => {
        window.dispatchEvent(new Event('resize'));
    });

    const cssRef = useRef({
        transform: 'none',
        top: '15%',
        left: 'auto',
        backgroundColor: 'white',
        right: 20,
        width: 600,
        height: 300
    });

    const cssRef1 = useRef({
        backgroundColor: 'white',
        color: '#0A2C3C'
    });

    return (
        <div zindex={-10}>
            <DialogDisclosure style={cssRef1.current} {...dialog}>
                <span className='w-32'>{!dialog.visible ? 'Show options' : 'Hide options'}</span>
            </DialogDisclosure>
            <Dialog {...dialog} style={cssRef.current} aria-label='Welcome'>
                <>
                    <TabList {...tab} aria-label='Option tabs'>
                        <Tab {...tab}>Axes</Tab>
                        <Tab {...tab}>Bounds</Tab>
                        <Tab {...tab}>Camera Options</Tab>
                        <Tab {...tab}>Solution curve</Tab>
                        <Tab {...tab}>Variables</Tab>
                    </TabList>
                    <TabPanel {...tab}>
                        <axesData.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <boundsData.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <orthoCameraData.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <solutionCurveData.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <labelData.component />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
}
