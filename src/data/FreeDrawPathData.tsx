import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import animFactory from '../factories/AnimationFactory';

import { diffObjects, isEmpty, round } from '@jesseburke/basic-utils';

import '../styles.css';

export default function FreeDrawPathData(arrayOfPathComps) {
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
