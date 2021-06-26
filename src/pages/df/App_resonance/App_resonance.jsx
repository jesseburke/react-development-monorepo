import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { atom, useAtom, Provider as JProvider } from 'jotai';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import MainDataComp from '../../../data/MainDataComp.jsx';

import SvgScene from '../../../SVGComps/SvgScene';
import SvgAxes from '../../../SVGComps/SvgBorderAxes';
import SvgFunctionGraph from '../../../SVGComps/SvgFunctionGraph';

import {
    funcAtom,
    labelData,
    solutionCurveData,
    axesData,
    atomStoreAtom,
    SecondOrderInput,
    svgData,
    modeAtom
} from './App_resonance_atoms.jsx';

//------------------------------------------------------------------------
//
// initial data
//

const btnClassStr =
    'absolute right-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 bg-gray-200 cursor-pointer text-lg';

const saveBtnClassStr = btnClassStr + ' bottom-24';

const resetBtnClassStr = btnClassStr + ' bottom-8';

const photoBtnClassStr = btnClassStr + ' bottom-8';

export default function App() {
    const DataComp = MainDataComp(atomStoreAtom);

    return (
        <JProvider>
            <div className='full-screen-base'>
                <Provider unstable_system={system}>
                    <header
                        className='control-bar-large bg-persian_blue-900 font-sans
			p-4 md:p-8 text-white'
                    >
                        <SecondOrderInput />
                        <OptionsModal />
                    </header>

                    <main className='flex-grow relative p-0'>
                        <SvgScene svgData={svgData} modeAtom={modeAtom}>
                            <SvgAxes />
                            <SvgFunctionGraph
                                funcAtom={funcAtom}
                                curveDataAtom={solutionCurveData.atom}
                            />
                        </SvgScene>

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
                        <Tab {...tab}>Solution curve</Tab>
                        <Tab {...tab}>Variables</Tab>
                    </TabList>
                    <TabPanel {...tab}>
                        <axesData.component />
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
