import { atom } from 'jotai';

import MainDataComp from '../../../data/MainDataComp.jsx';
import LabelDataComp from '../../../data/LabelDataComp.jsx';
import FunctionDataComp from '../../../data/FunctionDataComp.jsx';
import AxesDataComp from '../../../data/AxesDataComp.jsx';
import BoundsDataComp from '../../../data/BoundsDataComp';
import AnimationData from '../../../data/AnimationData';
import PerspCameraData from '../../../data/PerspCameraDataComp';
import OrthoCameraDataComp from '../../../data/OrthoCameraDataComp';

//------------------------------------------------------------------------
//
// initial constants

export const halfXSize = 20;
export const halfYSize = 14;
export const gridSize = 100;

const initBounds = { xMin: -1, xMax: 10, yMin: -10, yMax: 10 };

const initOrthographicData = {
    position: [0, 0, 10],
    up: [0, 0, 1],
    //fov: 75,
    near: -1,
    far: 50,
    orthographic: { left: -halfXSize, right: halfXSize, top: halfYSize, bottom: -halfYSize }
};

const initCameraData = {
    center: [0, 0, 0],
    zoom: 0.2,
    position: [0, 0, 50]
};

//------------------------------------------------------------------------
//
// atoms

const boundsData = BoundsDataComp({
    initBounds
});

export { boundsData };

const cameraData = OrthoCameraDataComp(initCameraData);

export { cameraData };

const atomStoreAtom = atom({
    bd: boundsData.readWriteAtom,
    cd: cameraData.readWriteAtom
});

//export const DataComp = MainDataComp(atomStoreAtom);
