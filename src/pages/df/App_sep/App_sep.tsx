import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import { ThreeSceneComp, useThreeCBs } from '../../../components/ThreeScene.js';
import ControlBar from '../../../components/ControlBar.jsx';
import Main from '../../../components/Main.jsx';
import ClickablePlaneComp from '../../../components/RecoilClickablePlaneComp.jsx';
import FullScreenBaseComponent from '../../../components/FullScreenBaseComponent.jsx';

import GridAndOrigin from '../../../ThreeSceneComps/GridAndOriginRecoil.jsx';
import Axes2D from '../../../ThreeSceneComps/Axes2DRecoil.jsx';
import ArrowGrid from '../../../ThreeSceneComps/ArrowGridRecoil.jsx';
import DirectionFieldApprox from '../../../ThreeSceneComps/DirectionFieldApproxRecoil.js';

import '../../../styles.css';

import { fonts, labelStyle } from '../constants.jsx';

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
    axesDataAtom,
    AxesDataInput,
    DataComp,
    SepEquationInput
} from './App_sep_data.tsx';

//------------------------------------------------------------------------
//
// initial data
//

const initColors = {
    solution: '#C2374F',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C'
};

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE },
    touches: { ONE: THREE.MOUSE.PAN, TWO: THREE.TOUCH.DOLLY, THREE: THREE.MOUSE.ROTATE },
    enableRotate: false,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false
};

const aspectRatio = window.innerWidth / window.innerHeight;
const frustumSize = 20;

const initCameraData = {
    position: [0, 0, 1],
    up: [0, 0, 1],
    //fov: 75,
    near: -100,
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
			p-4 md:p-8 text-white'
                    >
                        <SepEquationInput />
                        <InitialPointInput />
                        <OptionsModal />
                    </header>

                    <main className='flex-grow relative p-0'>
                        <ThreeSceneComp
                            initCameraData={initCameraData}
                            controlsData={initControlsData}
                            showPhotoButton={false}
                            photoBtnClassStr={photoBtnClassStr}
                        >
                            <GridAndOrigin boundsAtom={boundsAtom} gridShow={true} />
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
                            <DirectionFieldApprox
                                initialPointAtom={initialPointAtom}
                                boundsAtom={boundsAtom}
                                funcAtom={funcAtom}
                                curveDataAtom={solutionCurveDataAtom}
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
        right: 20,
        //width: 400,
        height: 250
    });

    const cssRef1 = useRef({ width: '8em' });

    const cssRef2 = useRef({ backgroundColor: 'white', color: initColors.controlBar });

    return (
        <div zindex={-10}>
            <DialogDisclosure style={cssRef2.current} {...dialog}>
                <span style={cssRef1.current}>
                    {!dialog.visible ? 'Show options' : 'Hide options'}
                </span>
            </DialogDisclosure>
            <Dialog {...dialog} style={cssRef.current} aria-label='Welcome'>
                <>
                    <TabList {...tab} aria-label='Option tabs'>
                        <Tab {...tab}>Arrow grid</Tab>
                        <Tab {...tab}>Axes</Tab>
                        <Tab {...tab}>Bounds</Tab>
                        <Tab {...tab}>Solution curve</Tab>
                        <Tab {...tab}>Variables</Tab>
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
