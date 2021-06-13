import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Provider as JProvider, useAtom } from 'jotai';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';

import * as system from 'reakit-system-bootstrap';

import SvgScene from '../../SVGComps/SvgScene';
import SvgAxes from '../../SVGComps/SvgAxes';

import {
    funcData,
    mathBoundsAtom,
    svgBoundsAtom,
    upperLeftPointData,
    zoomData,
    axesData,
    svgHeightAndWidthAtom,
    mathToSvgFuncAtom,
    modeAtom,
    DataComp
} from './App_svgTest_atoms';

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

const btnClassStr =
    'absolute left-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 bg-gray-200 cursor-pointer text-lg';

const saveBtnClassStr = btnClassStr + ' bottom-24';

const resetBtnClassStr = btnClassStr + ' bottom-8';

//------------------------------------------------------------------------

export default function App() {
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
                    <SvgScene
                        heightAndWidthAtom={svgHeightAndWidthAtom}
                        svgBoundsAtom={svgBoundsAtom}
                        mathToSvgFuncAtom={mathToSvgFuncAtom}
                        upperLeftPointAtom={upperLeftPointData.atom}
                        zoomAtom={zoomData.atom}
                        modeAtom={modeAtom}
                    >
                        <SvgAxes
                            mathBoundsAtom={mathBoundsAtom}
                            svgBoundsAtom={svgBoundsAtom}
                            zoomAtom={zoomData.atom}
                        />
                    </SvgScene>
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
                    </TabList>
                    <TabPanel {...tab}>
                        <axesData.component />
                    </TabPanel>
                </>
            </Dialog>
        </div>
    );
}
