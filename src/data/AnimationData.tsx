import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import gsap from 'gsap';
import queryString from 'query-string-esm';
import { useImmerAtom } from 'jotai/immer';

import Slider from '../components/Slider.jsx';

import { diffObjects, isEmpty, round } from '../utils/BaseUtils';
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

    const serializeAtom = atom(null, (get, set, action) => {
        if (action.type === 'serialize') {
            const { t, paused, animationTime } = diffObjects(get(animationAtom), initValue);

            let ro: AnimationDataType = {};

            if (t) ro.t = t;
            if (paused) ro.p = paused ? 0 : 1;
            if (animationTime) ro.a = animationTime;

            if (isEmpty(ro)) return;

            action.callback(ro);
        } else if (action.type === 'deserialize') {
            const objStr = action.value;

            if (!objStr || !objStr.length || objStr.length === 0) {
                set(animationAtom, initValue);
                return;
            }

            const rawObj: AnimationData = queryString.parse(objStr);

            const newKeys = Object.keys(rawObj);

            const ro = {};

            if (newKeys.includes('t')) ro.t = Number(rawObj.t);
            if (newKeys.includes('p')) ro.paused = rawObj.p === 0 ? false : true;
            if (newKeys.includes('a')) ro.animationTime = Number(rawObj.a);

            set(animationAtom, { ...initValue, ...ro });
        }
    });

    const component = React.memo(() => {
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
    });

    animationAtom.serializeAtom = serializeAtom;
    animationAtom.component = component;

    return animationAtom;
}

const animFactory = ({
    startTime,
    duration,
    updateCB,
    repeatCB = () => null,
    repeatDelay = 0.75
}) => {
    let animatedObject = { time: 0 };

    const tl = gsap.timeline();

    tl.to(animatedObject, {
        time: 1,
        ease: 'none',
        duration,
        paused: false,
        repeat: -1,
        onUpdate: () => updateCB(animatedObject.time)
    });

    tl.pause();

    // the argument should be in seconds
    tl.play(startTime * duration);

    return tl;
};
