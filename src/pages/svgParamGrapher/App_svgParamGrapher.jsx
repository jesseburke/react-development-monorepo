import React, { useState, useRef, useEffect, useCallback } from 'react';

import { OptionsTabComp } from '@jesseburke/components';

import { SvgScene } from '@jesseburke/svg-scene-with-react';
import { SvgBorderAxes } from '@jesseburke/svg-scene-with-react';
import { SvgAxes } from '@jesseburke/svg-scene-with-react';
import { SvgParamGraph } from '@jesseburke/svg-scene-with-react';

import {
    xFuncData,
    yFuncData,
    svgData,
    curveData,
    ParamEqInput,
    DataComp
} from './App_svgParamGrapher_atoms';

const btnClassStr =
    'absolute right-8 p-2 border med:border-2 rounded-md border-solid border-persian_blue-900 bg-gray-200 cursor-pointer text-lg';

const saveBtnClassStr = btnClassStr + ' bottom-24';

const resetBtnClassStr = btnClassStr + ' bottom-8';

//------------------------------------------------------------------------

export default function App() {
    return (
        <div className='full-screen-base'>
            <header
                className='control-bar bg-persian_blue-900 font-sans
		p-8 text-white'
            >
                <ParamEqInput />
                <OptionsTabComp
                    className={'w-32 bg-gray-50 text-persian_blue-900 p-2 rounded'}
                    nameComponentArray={[['Curve options', curveData.component]]}
                />
            </header>

            <main className='flex-grow relative p-0'>
                <SvgScene svgData={svgData}>
                    <SvgAxes />
                    <SvgParamGraph
                        xFuncAtom={xFuncData.funcAtom}
                        yFuncAtom={yFuncData.funcAtom}
                        curveDataAtom={curveData.atom}
                    />
                    <SvgBorderAxes />
                </SvgScene>
                <DataComp resetBtnClassStr={resetBtnClassStr} saveBtnClassStr={saveBtnClassStr} />
            </main>
        </div>
    );
}
