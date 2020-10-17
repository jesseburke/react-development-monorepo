import React from 'react';

export default function ConditionalDisplay({ test, children }) {
    if (test) {
        return <div>{children}</div>;
    } else {
        return null;
    }
}
