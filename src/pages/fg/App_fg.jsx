import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';

import * as system from 'reakit-system-bootstrap';

import { ThreeSceneComp } from '../../components/ThreeScene';
import MainDataComp from '../../data/MainDataComp.jsx';
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
                    <Provider unstable_system={system}>
                        <OptionsModal />
                    </Provider>
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

function OptionsModal() {
    const dialog = useDialogState({ modal: false });
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
        <div zindex={-10} className='text-sm'>
            <DialogDisclosure style={cssRef1.current} {...dialog}>
                <span className='w-32'>{!dialog.visible ? 'Show options' : 'Hide options'}</span>
            </DialogDisclosure>
            <Dialog
                {...dialog}
                style={cssRef.current}
                aria-label='Options'
                hideOnClickOutside={false}
            >
                <>
                    <TabList {...tab} aria-label='Option tabs'>
                        <Tab {...tab}>Axes</Tab>
                        <Tab {...tab}>Bounds</Tab>
                        <Tab {...tab}>Camera Options</Tab>
                        <Tab {...tab}>Variable labels</Tab>
                    </TabList>
                    <TabPanel {...tab}>
                        <axesData.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <boundsData.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <cameraData.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <labelData.component />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
}
