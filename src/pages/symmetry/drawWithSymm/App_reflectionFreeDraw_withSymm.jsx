import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import * as THREE from 'three';

import { ThreeSceneComp, useThreeCBs } from '../../../ThreeSceneComps/ThreeScene';
import Grid from '../../../ThreeSceneComps/Grid';
import Axes2D from '../../../ThreeSceneComps/Axes2D.jsx';
import Line from '../../../ThreeSceneComps/Line';
import FreeDrawComp from '../../../ThreeSceneComps/FreeDraw.jsx';
import ClickablePlaneComp from '../../../ThreeSceneComps/ClickablePlane.jsx';

import {
    boundsData,
    axesData,
    linePointAtom,
    lineDataAtom,
    LineInputComp
} from './App_reflectionFreeDraw_withSymm_atoms';

//------------------------------------------------------------------------

const aspectRatio = window.innerWidth / window.innerHeight;

const fixedCameraData = {
    up: [0, 1, 0],
    near: 0.1,
    far: 100,
    aspectRatio,
    orthographic: true
};

const initControlsData = {
    enabled: false
};

//------------------------------------------------------------------------

export default function App() {
    const line = useAtom(lineDataAtom)[0];

    return (
        <div className='full-screen-base'>
            <ThreeSceneComp fixedCameraData={fixedCameraData} controlsData={initControlsData}>
                <Axes2D
                    tickDistance={1}
                    boundsAtom={boundsData.atom}
                    axesDataAtom={axesData.atom}
                />
                <Grid boundsAtom={boundsData.atom} gridShow={true} />
                <FreeDrawComp transforms={[line.reflectGeometry]} />
                <Line lineDataAtom={lineDataAtom} boundsAtom={boundsData.atom} />
            </ThreeSceneComp>

            <LineInputComp originLineP={true} />
        </div>
    );
}
