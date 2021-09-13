import gsap from 'gsap';

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

export default animFactory;
