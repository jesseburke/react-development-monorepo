// copied from https://github.com/craig1123/react-recipes,
// haven't tested

import { useEffect, useRef, useState } from 'react';

export const useThrottle = (value, ms = 200) => {
    const [state, setState] = useState(value);
    const timeout = useRef();
    const nextValue = useRef(null);
    const hasNextValue = useRef(0);

    useEffect(() => {
        if (!timeout.current) {
            setState(value);
            const timeoutCallback = () => {
                if (hasNextValue.current) {
                    hasNextValue.current = false;
                    setState(nextValue.current);
                    timeout.current = setTimeout(timeoutCallback, ms);
                } else {
                    timeout.current = undefined;
                }
            };
            timeout.current = setTimeout(timeoutCallback, ms);
        } else {
            nextValue.current = value;
            hasNextValue.current = true;
        }
    }, [value]);

    // clear on unmount
    useEffect(() => () => timeout.current && clearTimeout(timeout.current));

    return state;
};

// Usage

// const App = ({ value }) => {
//   const throttledValue = useThrottle(value, 250);

//   return (
//     <>
//       <div>Value: {value}</div>
//       <div>Throttled value: {throttledValue}</div>
//     </>
//   );
// };
