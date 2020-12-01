import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Provider as JProvider } from 'jotai';

import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';

import * as system from 'reakit-system-bootstrap';

import './styles.css';

import { useThreeCBs, ThreeSceneComp } from '../../components/ThreeScene.jsx';
import ControlBar from '../../components/ControlBar.jsx';
import Main from '../../components/Main.jsx';
import ClickablePlaneComp from '../../components/RecoilClickablePlaneComp.jsx';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.jsx';

import Grid from '../../ThreeSceneComps/Grid.jsx';
import Axes2D from '../../ThreeSceneComps/Axes2DRecoil.jsx';
import ArrowGrid from '../../ThreeSceneComps/ArrowGridRecoil.jsx';
import DirectionFieldApprox from '../../ThreeSceneComps/DirectionFieldApproxRecoil.jsx';

import { fonts, labelStyle } from './constants.jsx';

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

const initColors = {
  arrows: '#C2374F',
  solution: '#C2374F',
  firstPt: '#C2374F',
  secPt: '#C2374F',
  testFunc: '#E16962', //#DBBBB0',
  axes: '#0A2C3C',
  controlBar: '#0A2C3C',
  clearColor: '#f0f0f0'
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
//const frustumSize = 20;
const frustumSize = 3.8;

const initCameraData = {
  position: [0, 0, 1],
  up: [0, 0, 1],
  //fov: 75,
  near: -100,
  far: 100,
  rotation: { order: 'XYZ' },
  orthographic: {
    left: (frustumSize * aspectRatio) / -2,
    right: (frustumSize * aspectRatio) / 2,
    top: frustumSize / 2,
    bottom: frustumSize / -2
  }
};

// percentage of screen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 13;

// (relative) font sizes (first in em's)
const fontSize = 1;
const controlBarFontSize = 1;

//------------------------------------------------------------------------

export default function App() {
  const threeSceneRef = useRef();

  //useHackyThreeInitDisplay(threeSceneRef);
  return (
    <JProvider>
      <FullScreenBaseComponent backgroundColor={initColors.controlBar} fonts={fonts}>
        <Provider unstable_system={system}>
          <ControlBar
            height={controlBarHeight}
            fontSize={fontSize * controlBarFontSize}
            padding='0em'
          >
            <div className='center-flex-row'>
              <EquationInput />
            </div>
            <InitialPointInput />
            <OptionsModal />
          </ControlBar>
        </Provider>

        <Main height={100 - controlBarHeight} fontSize={fontSize * controlBarFontSize}>
          <ThreeSceneComp
            initCameraData={initCameraData}
            controlsData={initControlsData}
            ref={(elt) => (threeSceneRef.current = elt)}
            showPhotoButton={false}
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
          <DataComp />
        </Main>
      </FullScreenBaseComponent>
    </JProvider>
  );
}

function useHackyThreeInitDisplay(threeSceneRef) {
  // following is very hacky way to get three displayed on initial render
  const threeCBs = useThreeCBs(threeSceneRef);

  const [loadAgain, setLoadAgain] = useState(0);

  useEffect(() => {
    if (!threeCBs) return;

    window.dispatchEvent(new Event('resize'));
    setLoadAgain(1);
  }, [threeCBs]);

  useEffect(() => {
    if (loadAgain < 1) return;

    window.dispatchEvent(new Event('resize'));
  }, [loadAgain]);
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
    width: 400,
    height: 250
  });

  const cssRef1 = useRef({ width: '8em' });

  const cssRef2 = useRef({ backgroundColor: 'white', color: initColors.controlBar });

  return (
    <div zindex={-10}>
      <DialogDisclosure style={cssRef2.current} {...dialog}>
        <span style={cssRef1.current}>{!dialog.visible ? 'Show options' : 'Hide options'}</span>
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
