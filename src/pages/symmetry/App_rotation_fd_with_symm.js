import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import './styles.css';

import useHashLocation from '../../hooks/useHashLocation.js';

import { ThreeSceneComp, useThreeCBs } from '../../components/ThreeScene.js';
import FreeDrawComp from '../../components/FreeDrawComp.js';

import RationalRotationCSFactory from '../../factories/RationalRotationCSFactory.js';

import useExpandingMesh from '../../graphics/useExpandingMesh.js';
import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use2DAxes from '../../graphics/use2DAxes.js';

import FullScreenBaseComponent from '../../components/FullScreenBaseComponent';
import Input from '../../components/Input.js';

import { fonts, initAxesData, initGridAndOriginData, initOrthographicData } from './constants.js';

const freeDrawMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xc2374f),
    opacity: 1.0,
    side: THREE.FrontSide
});
const fixedMaterial = freeDrawMaterial.clone();
fixedMaterial.opacity = 0.35;
fixedMaterial.transparent = true;

const roundingConst = 2;

export default function App() {
    const [, navigate] = useHashLocation();

    // this is only used to define threeCBs (which are used everywhere)
    const threeSceneRef = useRef(null);

    // following is passed to components that draw
    const threeCBs = useThreeCBs(threeSceneRef);

    const [rotationArray, setRotationArray] = useState(null);
    const [transforms, setTransforms] = useState([]);

    const cameraData = useRef(initOrthographicData, []);

    const userMesh = useExpandingMesh({ threeCBs });

    useGridAndOrigin({ threeCBs, gridData: initGridAndOriginData });
    use2DAxes({ threeCBs, axesData: initAxesData });

    //------------------------------------------------------------------------

    const clearCB = useCallback(() => {
        if (!threeCBs) return;

        if (userMesh) {
            userMesh.clear();
        }

        navigate('/');
    }, [threeCBs, userMesh, navigate]);

    const freeDrawDoneCBs = [userMesh.expandCB];

    const angleCB = useCallback((inputStr) => {
        const [m, n] = toFrac(Number(inputStr), roundingConst);

        if (m === 0) {
            setRotationArray(null);
            return;
        }

        const rrcs = RationalRotationCSFactory(m, n);

        setRotationArray(rrcs);
    }, []);

    useEffect(() => {
        if (!rotationArray) {
            setTransforms([]);
            return;
        }

        setTransforms(rotationArray.getElementArray());
    }, [rotationArray]);

    return (
        <FullScreenBaseComponent fonts={fonts}>
            <ThreeSceneComp ref={threeSceneRef} initCameraData={cameraData.current} />

            <FreeDrawComp
                threeCBs={threeCBs}
                doneCBs={freeDrawDoneCBs}
                clearCB={clearCB}
                material={freeDrawMaterial}
                transforms={transforms}
            />
            <div className='reflection-box'>
                <div className='top-line-reflection-box'>
                    <span className='med-margin'> Symmetric under rotation by </span>
                    <Input size={4} onC={angleCB} />
                </div>
                <div className='top-line-reflection-box'>
                    Rotational Symmetry Group:
                    {rotationArray ? 'C' + rotationArray.getOrder() : null}
                </div>
            </div>
        </FullScreenBaseComponent>
    );
}

const toFrac = (x, n) => {
    if (!Number.isInteger(n)) {
        console.log('toFrac received a non-integer second argument; returned null');

        return null;
    }

    if (n <= 0) return x;

    let num = x * Math.pow(10, n);
    let denom = Math.pow(10, n);

    while (num % 10 === 0 && denom >= 10) {
        num = num / 10;
        denom = denom / 10;
    }

    return [num, denom];
};