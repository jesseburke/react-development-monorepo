import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Provider as JotaiProvider } from 'jotai';

import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider as ReakitProvider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import './styles.css';

import { ThreeSceneComp } from './components/ThreeScene';

import Grid from './ThreeScene/Grid';
import Axes2D from './ThreeScene/Axes2D.jsx';
import ArrowGrid from './ThreeScene/ArrowGrid.jsx';
import DirectionFieldApprox from './ThreeScene/DirectionFieldApprox';
import ClickablePlane from './ThreeScene/ClickablePlane.jsx';

import {
    arrowGridDataAtom,
    boundsAtom,
    initialPointAtom,
    funcAtom,
    labelAtom,
    solutionCurveDataAtom,
    axesDataAtom,
    DataComp
} from './App_df_data';

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY_PAN, THREE: THREE.MOUSE.ROTATE },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

const aspectRatio = window.innerWidth / window.innerHeight;
//const frustumSize = 20;
const frustumSize = 3.8;

const initCameraData = {
    position: [0, 0, 1],
    up: [0, 0, 1],
    //fov: 75,
    near: 0.01,
    far: 100,
    rotation: { order: 'XYZ' },
    frustumSize,
    aspectRatio,
    orthographic: {
        left: (frustumSize * aspectRatio) / -2,
        right: (frustumSize * aspectRatio) / 2,
        top: frustumSize / 2,
        bottom: frustumSize / -2
    }
};

const saveBtnClassStr =
    'absolute left-8 bottom-40 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 cursor-pointer text-xl';

const resetBtnClassStr =
    'absolute left-8 bottom-24 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 cursor-pointer text-xl';

const photoBtnClassStr =
    'absolute left-8 bottom-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 cursor-pointer text-xl';

//------------------------------------------------------------------------

export default function App() {
    return (
        <JotaiProvider>
            <div className='full-screen-base'>
                <header
                    className='control-bar bg-persian_blue-900 font-sans
		    p-8 text-white'
                >
                    <funcAtom.component />

                    <initialPointAtom.component />
                    <ReakitProvider unstable_system={system}>
                        <OptionsModal />
                    </ReakitProvider>
                </header>

                <main className='flex-grow relative p-0'>
                    <ThreeSceneComp
                        initCameraData={initCameraData}
                        controlsData={initControlsData}
                        showPhotoBtn={true}
                        photoBtnClassStr={photoBtnClassStr}
                    >
                        <DirectionFieldApprox
                            initialPointAtom={initialPointAtom}
                            boundsAtom={boundsAtom}
                            funcAtom={funcAtom}
                            curveDataAtom={solutionCurveDataAtom}
                        />
                        <Grid boundsAtom={boundsAtom} gridShow={true} />
                        <Axes2D
                            tickLabelDistance={1}
                            boundsAtom={boundsAtom}
                            axesDataAtom={axesDataAtom}
                            labelAtom={labelAtom}
                        />
                        <ArrowGrid
                            funcAtom={funcAtom}
                            boundsAtom={boundsAtom}
                            arrowGridDataAtom={arrowGridDataAtom}
                        />
                        <ClickablePlane clickPositionAtom={initialPointAtom} />
                    </ThreeSceneComp>
                    <DataComp
                        resetBtnClassStr={resetBtnClassStr}
                        saveBtnClassStr={saveBtnClassStr}
                    />
                </main>
            </div>
        </JotaiProvider>
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
        width: 500,
        height: 250
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
                        <Tab {...tab}>Solution curve</Tab>
                        <Tab {...tab}>Variable labels</Tab>
                    </TabList>
                    <TabPanel {...tab}>
                        <arrowGridDataAtom.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <axesDataAtom.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <boundsAtom.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <solutionCurveDataAtom.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <labelAtom.component />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
}
