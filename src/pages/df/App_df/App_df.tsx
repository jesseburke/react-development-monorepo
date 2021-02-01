import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import '../../../styles.css';

import { ThreeSceneComp } from '../../../components/ThreeScene.jsx';
import ClickablePlaneComp from '../../../components/RecoilClickablePlaneComp.jsx';

import Grid from '../../../ThreeSceneComps/Grid.jsx';
import Axes2D from '../../../ThreeSceneComps/Axes2DRecoil.jsx';
import ArrowGrid from '../../../ThreeSceneComps/ArrowGridRecoil.jsx';
import DirectionFieldApprox from '../../../ThreeSceneComps/DirectionFieldApproxRecoil.jsx';

import {
    arrowGridDataAtom,
    ArrowGridDataInput,
    boundsAtom,
    BoundsInput,
    initialPointAtom,
    InitialPointInput,
    funcAtom,
    labelAtom,
    LabelInput,
    solutionCurveDataAtom,
    SolutionCurveDataInput,
    EquationInput,
    axesDataAtom,
    AxesDataInput,
    DataComp
} from './App_df_data.jsx';

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
        <JProvider>
            <div className='full-screen-base'>
                <Provider unstable_system={system}>
                    <header
                        className='control-bar bg-persian_blue-900 font-sans
			p-8 text-white'
                    >
                        <div className='p-1'>
                            <EquationInput />
                        </div>
                        <InitialPointInput />
                        <OptionsModal />
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
                            <ClickablePlaneComp clickPositionAtom={initialPointAtom} />
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
                        <ArrowGridDataInput />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <AxesDataInput />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <BoundsInput />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <SolutionCurveDataInput />
                    </TabPanel>
                    <TabPanel {...tab}>
                        <LabelInput />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
}
