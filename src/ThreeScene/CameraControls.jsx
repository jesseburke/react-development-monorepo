import React, { useEffect, useRef } from 'react';
import { useAtom, atom } from 'jotai';
import * as THREE from 'three';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Provider as ReakitProvider } from 'reakit/Provider';
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab';
import * as system from 'reakit-system-bootstrap';

import '../styles.css';

export default function CameraControls({ cameraDataAtom, classStr, threeCBs }) {
    const [cameraData, setCameraData] = useAtom(cameraDataAtom);

    useEffect(() => {
        if (!threeCBs) return;

        const center = cameraData.center;
        //console.log('cameraData.center = ', cameraData.center);

        //threeCBs.setCameraPosition([center[0], center[1], 1]);
        //threeCBs.changeControls({ target: new THREE.Vector3(...center) });
        threeCBs.render();
    }, [threeCBs, cameraData.center]);

    useEffect(() => {
        if (!threeCBs) return;

        const en = cameraData.rotationEnabled;

        if (en) {
            //console.log('rotationEnabledCB called with en = ', en);
            threeCBs.changeControls({ enableRotate: en });
            threeCBs.render();
        }

        // TO ADD!!!!!
        // need to figure out to do when this is un-enabled
    }, [threeCBs, cameraData.rotationEnabled]);

    useEffect(() => {
        if (!threeCBs) return;

        // need to use aspect ratio to set left, right, top and
        // bottom of the camera
    }, [threeCBs, cameraData.viewHeight]);

    return null;
}
