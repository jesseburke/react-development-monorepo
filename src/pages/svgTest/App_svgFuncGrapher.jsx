import React, { useState, useRef, useEffect, useCallback } from 'react';

import { MainDataComp } from '@jesseburke/jotai-data-setup';
import { OptionsTabComp } from '@jesseburke/components';

import { SvgScene } from '@jesseburke/svg-scene-with-react';
import { SvgBorderAxes } from '@jesseburke/svg-scene-with-react';
import { SvgAxes } from '@jesseburke/svg-scene-with-react';
import { SvgFunctionGraph } from '@jesseburke/svg-scene-with-react';

import { funcData, svgData, curveData, atomStoreAtom } from './App_svgFuncGrapher_atoms';

const btnClassStr =
    'absolute right-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 bg-gray-200 cursor-pointer text-lg';

const saveBtnClassStr = btnClassStr + ' bottom-24';

const resetBtnClassStr = btnClassStr + ' bottom-8';

//------------------------------------------------------------------------

export default function App() {
    const DataComp = MainDataComp(atomStoreAtom);

    return (
        <div className='full-screen-base'>
            <header
                className='control-bar bg-persian_blue-900 font-sans
		p-8 text-white'
            >
                <funcData.component />
                <OptionsTabComp
                    className={'w-32 bg-gray-50 text-persian_blue-900 p-2 rounded'}
                    nameComponentArray={[['Curve options', curveData.component]]}
                />
            </header>

            <main className='flex-grow relative p-0'>
                <SvgScene svgData={svgData}>
                    <SvgAxes />
                    <SvgBorderAxes />
                    <SvgFunctionGraph funcAtom={funcData.funcAtom} curveDataAtom={curveData.atom} />
                </SvgScene>
                <DataComp resetBtnClassStr={resetBtnClassStr} saveBtnClassStr={saveBtnClassStr} />
            </main>
        </div>
    );
}
