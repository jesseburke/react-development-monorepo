import React, { useState, useRef, useEffect } from 'react';

import Input from './Input.jsx';

export default React.memo(function FunctionBounds({
    bounds: { xMin, xMax, yMin, yMax },
    onChange
}) {
    const [bounds, setBounds] = useState({ xMin, xMax, yMin, yMax });

    return (
        <div
            css={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '.5em',
                margin: '.5em'
            }}
        >
            <div
                css={{
                    fontSize: '1em',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                Function Bounds
                <hr style={{ width: '100%' }} />
            </div>
            <div
                css={{
                    display: 'grid',
                    gridTemplateRows: 'repeat(5, auto)',
                    gridTemplateColumns: 'repeat(5, auto)'
                }}
            >
                <div
                    css={{
                        gridColumn: '3 / 4',
                        gridRow: '1 / 2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '.5em'
                    }}
                >
                    <span>yMax</span>
                </div>
                <div
                    css={{
                        gridColumn: '3 / 4',
                        gridRow: '2 / 3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Input
                        size={10}
                        initValue={bounds.yMax}
                        onC={(y) => {
                            setBounds((oldBounds) => ({ ...oldBounds, yMax: parseFloat(y) }));
                            onChange({ ...bounds, yMax: parseFloat(y) });
                        }}
                    />
                </div>
                <div
                    css={{
                        gridColumn: '1 / 2',
                        gridRow: '3 / 4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '.5em'
                    }}
                >
                    <span>xMin</span>
                </div>
                <div
                    css={{
                        gridColumn: '2 / 3',
                        gridRow: '3 / 4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Input
                        size={10}
                        initValue={bounds.xMin}
                        onC={(x) => {
                            setBounds((oldBounds) => ({ ...oldBounds, xMin: parseFloat(x) }));
                            onChange({ ...bounds, xMin: parseFloat(x) });
                        }}
                    />
                </div>
                <div
                    css={{
                        gridColumn: '4 / 5',
                        gridRow: '3 / 4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Input
                        size={10}
                        initValue={bounds.xMax}
                        onC={(x) => {
                            setBounds((oldBounds) => ({ ...oldBounds, xMax: parseFloat(x) }));
                            onChange({ ...bounds, xMax: parseFloat(x) });
                        }}
                    />
                </div>
                <div
                    css={{
                        gridColumn: '5 / 6',
                        gridRow: '3 / 4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '.5em'
                    }}
                >
                    <span>xMax</span>
                </div>
                <div
                    css={{
                        gridColumn: '3 / 4',
                        gridRow: '4 / 5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Input
                        size={10}
                        initValue={yMin}
                        onC={(y) => {
                            setBounds((oldBounds) => ({ ...oldBounds, yMin: parseFloat(y) }));
                            onChange({ ...bounds, yMin: parseFloat(y) });
                        }}
                    />
                </div>
                <div
                    css={{
                        gridColumn: '3 / 4',
                        gridRow: '5 / 6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '.5em'
                    }}
                >
                    <span>yMin</span>
                </div>
            </div>
        </div>
    );
});
