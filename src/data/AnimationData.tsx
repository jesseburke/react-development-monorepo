import React, { useState, useRef, useEffect, useCallback } from 'react';
import { atom, useAtom } from 'jotai';
import gsap from 'gsap';
import queryString from 'query-string-esm';

import Slider from '../components/Slider.jsx';

import { diffObjects, isEmpty, round } from '../utils/BaseUtils';
import { AnimationDataType } from '../my-types';

import '../styles.css';

const defaultInitValue: AnimationDataType = {
    t: 0,
    paused: true,
    animationTime: 12,
    min: 0,
    max: 20
};

export default function AnimationData(args) {
    const initValue = { ...defaultInitValue, ...args };

    const animationAtom = atom(initValue);
    const togglePauseAtom = atom(null, (get, set) => {
        const a = get(animationAtom);

        set(animationAtom, { ...a, paused: !a.paused });
    });

    const pauseAtom = atom(null, (get, set) =>
        set(animationAtom, { ...get(animationAtom), paused: true })
    );

    const writeTAtom = atom(null, (get, set, newT) => {
        const a = get(animationAtom);

        set(animationAtom, { ...a, t: newT });
    });

    const serializeAtom = atom(null, (get, set, action) => {
        if (action.type === 'serialize') {
            const { t0, paused, animationTime } = diffObjects(get(animationAtom), initValue);

            let ro: AnimationDataType = {};

            if (t0) ro.t = t0;
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

            if (newKeys.includes('t')) ro.t0 = Number(rawObj.t);
            if (newKeys.includes('p')) ro.paused = rawObj.p === 0 ? false : true;
            if (newKeys.includes('a')) ro.animationTime = Number(rawObj.a);

            set(animationAtom, { ...initValue, ...ro });
        }
    });

    const component = React.memo(() => {
        const animationData = useAtom(animationAtom)[0];
        const togglePause = useAtom(togglePauseAtom)[1];
        const pause = useAtom(pauseAtom)[1];
        const writeT = useAtom(writeTAtom)[1];

        const { t, paused, animationTime, min, max } = animationData;

        const sliderCB = useCallback((newT) => {
            // if the animation is not paused, and the slider is used,
            // then pause
            pause();
            writeT(Number(newT));
        }, []);
        const pauseCB = useCallback(() => {
            togglePause();
        }, []);

        const [timeline, setTimeline] = useState(null);

        useEffect(() => {
            if (paused) {
                if (timeline) {
                    timeline.pause();
                }
                setTimeline(null);
                return;
            }

            const repeatCB = () => writeT(min);

            setTimeline(
                animFactory({
                    startTime: t / max,
                    duration: animationTime,
                    repeatCB,
                    updateCB: (newT) => writeT(round(newT * max))
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
    let time = { t: 0 };

    const tl = gsap.timeline();

    tl.to(time, {
        t: 1,
        ease: 'none',
        duration,
        paused: false,
        repeat: -1,
        onUpdate: () => updateCB(time.t)
    });

    tl.pause();
    //tl.seek(startTime*duration);
    //tl.resume();

    tl.play(startTime * duration);

    return tl;
};
