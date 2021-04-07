import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Provider as JotaiProvider } from 'jotai';

import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider as ReakitProvider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import './styles.css';

import { ThreeSceneComp } from './components/ThreeScene';
import CanvasComp from './components/CanvasCompHalfWidth.jsx';

import Grid from './ThreeSceneComps/Grid';
import Plane from './ThreeSceneComps/Plane';
import Axes3D from './ThreeSceneComps/Axes3D.jsx';
import FunctionGraph3D from './ThreeSceneComps/FunctionGraph3D.jsx';
import CameraControls from './ThreeSceneComps/CameraControls.jsx';

import Axes2DCanv from './CanvasComps/Axes2D.jsx';
import FunctionGraph2D from './CanvasComps/FunctionGraph2D.jsx';

import {
    boundsAtom,
    canvasBoundsAtom,
    gridBoundsAtom,
    funcAtom,
    twoDFuncAtom,
    labelAtom,
    axesDataAtom,
    cameraDataAtom,
    animationDataAtom,
    planeHeightAndWidthAtom,
    planeCenterAtom,
    DataComp
} from './atoms.ts';

import theme from './theme.js';

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpacePanning: false
};

const fixedCameraData = {
    up: [0, 0, 1],
    near: 0.1,
    far: 100,
    orthographic: false
};

const btnClassStr =
    'absolute left-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 bg-gray-200 cursor-pointer text-lg';

const saveBtnClassStr = btnClassStr + ' bottom-24';

const resetBtnClassStr = btnClassStr + ' bottom-8';

//------------------------------------------------------------------------

export default function App() {
    //console.log(theme.colors);

    return (
        <JotaiProvider>
            <div className='full-screen-base'>
                <header
                    className='control-bar bg-royalblue-900 font-sans
		    p-8 text-white'
                >
                    <funcAtom.component />
                    <ReakitProvider unstable_system={system}>
                        <animationDataAtom.component />
                        <OptionsModal />
                    </ReakitProvider>
                </header>

                <main className='flex-grow relative p-0'>
                    <ThreeSceneComp
                        halfWidth={true}
                        fixedCameraData={fixedCameraData}
                        controlsData={initControlsData}
                    >
                        <Axes3D
                            boundsAtom={boundsAtom}
                            axesDataAtom={axesDataAtom}
                            labelAtom={labelAtom}
                        />
                        <Grid boundsAtom={gridBoundsAtom} gridShow={true} />
                        <FunctionGraph3D funcAtom={funcAtom} boundsAtom={boundsAtom} />
                        <Plane
                            heightAndWidthAtom={planeHeightAndWidthAtom}
                            centerAtom={planeCenterAtom}
                        />
                        <CameraControls cameraDataAtom={cameraDataAtom} />
                    </ThreeSceneComp>
                    <CanvasComp>
                        <Axes2DCanv boundsAtom={canvasBoundsAtom} lineWidth={5} yLabel='z' />
                        <FunctionGraph2D funcAtom={twoDFuncAtom} boundsAtom={boundsAtom} />
                    </CanvasComp>
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
        width: 400,
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
                        <Tab {...tab}>Bounds</Tab>
                        <Tab {...tab}>Camera Options</Tab>
                    </TabList>
                    <TabPanel {...tab}>
                        <boundsAtom.component />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <cameraDataAtom.component />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
}
