import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import queryString from 'query-string-esm';
import { useImmerAtom } from 'jotai/immer';

import { Slider } from '@jesseburke/components';
import animFactory from '../factories/AnimationFactory';

import { diffObjects, isEmpty, round } from '@jesseburke/basic-utils';
import { AnimationDataType } from '../my-types';

import '../styles.css';

const defaultInitValue: AnimationDataType = {
    t: 0,
    paused: true,
    animationTime: 12
    //min: 0,
    //max: 20
};

// problem here: want to connect, e.g., min, to another piece of data

export default function AnimationData({
    animationTime = defaultInitValue.animationTime,
    minMaxAtom
}) {
    const initValue = { ...defaultInitValue, animationTime };

    const animationAtom = atom(initValue);

    const readWriteAtom = atom(null, (get, set, action) => {
        switch (action.type) {
            case 'reset':
                set(animationAtom, initValue);
                break;

            case 'readAndEncode':
                const { t, paused, animationTime } = diffObjects(get(animationAtom), initValue);

                let ro: AnimationDataType = {};

                if (t) ro.t = t;
                if (paused) ro.p = paused ? 0 : 1;
                if (animationTime) ro.a = animationTime;

                if (isEmpty(ro)) return;

                action.callback(ro);
                break;

            case 'decodeAndWrite':
                const rawObj: AnimationData = action.value;

                const newKeys = Object.keys(rawObj);

                const nro = {};

                if (newKeys.includes('t')) nro.t = Number(rawObj.t);
                if (newKeys.includes('p')) nro.paused = rawObj.p === 0 ? false : true;
                if (newKeys.includes('a')) nro.animationTime = Number(rawObj.a);

                set(animationAtom, { ...initValue, ...nro });
                break;
        }
    });

    const component = () => {
        //----------------------------------------
        //
        // animationData related
        //
        const [animationData, setAnimationData] = useImmerAtom(animationAtom);
        const { t, paused, animationTime } = animationData;

        const sliderCB = useCallback((newT) => {
            setAnimationData((draft) => {
                draft.paused = true;
                draft.t = round(Number(newT));
            });
        }, []);

        const repeatCB = useCallback((newT) => {
            setAnimationData((draft) => {
                draft.t = min;
            });
        }, []);

        const updateCB = useCallback((newTime) => {
            setAnimationData((draft) => {
                draft.t = round(newTime * (max - min) + min);
            });
        }, []);

        const pauseCB = useCallback(() => {
            setAnimationData((draft) => {
                draft.paused = !draft.paused;
            });
        }, []);

        //----------------------------------------

        const { min, max } = useAtom(minMaxAtom)[0];

        const [timeline, setTimeline] = useState(null);

        useEffect(() => {
            if (paused) {
                if (timeline) {
                    timeline.pause();
                }
                setTimeline(null);
                return;
            }

            setTimeline(
                animFactory({
                    startTime: (t - min) / (max - min),
                    duration: animationTime,
                    repeatCB,
                    updateCB
                })
            );
        }, [paused, max, animationTime, min]);

        return (
            <div className='flex content-around items-center p-4 text-white'>
                <Slider value={t} CB={sliderCB} label={'t0'} max={max} min={min} />
                <span onClick={pauseCB} className='m-4 p-4 border-2 flex-1'>
                    {paused ? '\u{25B6}' : '\u{23F8}'}
                </span>
            </div>
        );
    };

    return { atom: animationAtom, readWriteAtom, component };
}
