import React, { useState, useRef, useEffect, useCallback } from 'react';

import { useDialogState, Dialog, DialogDisclosure } from 'reakit/Dialog';
import { Button } from 'reakit/Button';
import { Portal } from 'reakit/Portal';
import { Provider } from 'reakit/Provider';

import * as system from 'reakit-system-bootstrap';

function App() {
    const dialog = useDialogState();
    return (
        <Provider unstable_system={system}>
            <React.Fragment>
                <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
                <Dialog {...dialog} aria-label='Welcome'>
                    Welcome to Reakit!
                    <Button onClick={dialog.hide}>Close dialog</Button>
                </Dialog>
            </React.Fragment>
        </Provider>
    );
}

function App0() {
    const dialog = useDialogState();
    return (
        <div>
            <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
            <Dialog
                {...dialog}
                aria-label='Welcome'
                style={{
                    backgroundColor: 'red',
                    top: 'auto',
                    left: 'auto',
                    bottom: 0,
                    right: 16,
                    width: 200,
                    height: 300
                }}
            >
                Welcome to Reakit!
            </Dialog>
        </div>
    );
}

export default function App1() {
    return (
        <Provider unstable_system={system}>
            <Example />
        </Provider>
    );
}

function Example() {
    const dialog = useDialogState({ modal: false });
    return (
        <>
            <DialogDisclosure {...dialog}>Show options</DialogDisclosure>
            <Dialog
                {...dialog}
                aria-label='Welcome'
                style={{
                    transform: 'none',
                    top: 'auto',
                    left: 'auto',
                    width: 200,
                    height: 300
                }}
            >
                <fieldset>
                    <span>someting going here soon</span>
                </fieldset>
            </Dialog>
        </>
    );
}
