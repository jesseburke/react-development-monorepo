import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import { ThreeSceneComp } from '../../../components/ThreeScene';

import Grid from '../../../ThreeSceneComps/Grid';
import Axes2D from '../../../ThreeSceneComps/Axes2D.jsx';
import ArrowGrid from '../../../ThreeSceneComps/ArrowGrid.jsx';
import IntegralCurve from '../../../ThreeSceneComps/IntegralCurve';
import CameraControls from '../../../ThreeSceneComps/CameraControls.jsx';

import {
    arrowGridData,
    boundsData,
    initialPointData,
    funcAtom,
    labelData,
    solutionCurveData,
    axesData,
    orthoCameraData,
    DataComp,
    zHeightAtom,
    LinearEquationInput
} from './App_linear_atoms.jsx';

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
    screenSpaceSpanning: true
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
    return (
        <JProvider>
            <div className='full-screen-base'>
                <Provider unstable_system={system}>
                    <header
                        className='control-bar bg-persian_blue-900 font-sans
			p-4 md:p-8 text-white'
                    >
                        <LinearEquationInput />
                        <initialPointData.component initialStr={'Initial Point: '} />
                        <OptionsModal />
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
                            <ArrowGrid
                                diffEqAtom={funcAtom}
                                boundsAtom={boundsData.atom}
                                arrowGridDataAtom={arrowGridData.atom}
                                zHeightAtom={zHeightAtom}
                            />
                            <IntegralCurve
                                initialPointAtom={initialPointData.atom}
                                boundsAtom={boundsData.atom}
                                diffEqAtom={funcAtom}
                                curveDataAtom={solutionCurveData.atom}
                                zHeightAtom={zHeightAtom}
                            />
                            <CameraControls cameraDataAtom={orthoCameraData.atom} />
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
                        <Tab {...tab}>Arrow grid</Tab>
                        <Tab {...tab}>Axes</Tab>
                        <Tab {...tab}>Bounds</Tab>
                        <Tab {...tab}>Camera Options</Tab>
                        <Tab {...tab}>Solution curve</Tab>
                        <Tab {...tab}>Variables</Tab>
                    </TabList>
                    <TabPanel {...tab}>
                        <arrowGridData.component />
                    </TabPanel>
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