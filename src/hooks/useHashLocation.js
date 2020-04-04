import React, { useState, useRef, useEffect, useCallback } from 'react';

//------------------------------------------------------------------------
//
// following is from https://codesandbox.io/s/wouter-hash-based-hook-5fp9g?from-embed
//

// returns the current hash location (excluding the '#' symbol)
const currentLoc = () => window.location.hash.replace("#", "") || "/";

export default function useHashLocation() {
    const [loc, setLoc] = useState(currentLoc());

    useEffect(() => {
        const handler = () => setLoc(currentLoc());

        // subscribe on hash changes
        window.addEventListener("hashchange", handler);
        return () => window.removeEventListener("hashchange", handler);
    }, []);

    const navigate = useCallback(to => (window.location.hash = to), []);
    return [loc, navigate];
};

//------------------------------------------------------------------------
