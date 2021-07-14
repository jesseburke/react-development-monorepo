import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import { ThreeSceneComp } from '../../../components/ThreeScene';
import Grid from '../../../ThreeSceneComps/Grid';
import Axes2D from '../../../ThreeSceneComps/Axes2D.jsx';
import FreeDrawComp from '../../../ThreeSceneComps/FreeDraw.jsx';

import { axesData, boundsData } from './App_freeDraw_atoms';

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

function App() {
    return (
        <div className='full-screen-base'>
            <ThreeSceneComp fixedCameraData={fixedCameraData} controlsData={initControlsData}>
                <Axes2D
                    tickDistance={1}
                    boundsAtom={boundsData.atom}
                    axesDataAtom={axesData.atom}
                />
                <Grid boundsAtom={boundsData.atom} gridShow={true} />
                <FreeDrawComp transforms={[]} />
            </ThreeSceneComp>
        </div>
    );
}

export default App;
