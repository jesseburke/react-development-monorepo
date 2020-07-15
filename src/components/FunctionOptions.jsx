import React, { useState, useRef, useEffect } from 'react';

import { Button } from './Button.jsx';
import { Input } from './Input.jsx';
import FunctionBounds from './FunctionBounds.jsx';

function FunctionOptions({ initData, onChange }) {
    const [newData, setNewData] = useState(initData);

    //let data = {func, xMin, xMax, yMin, yMax, meshSize, color};

    return (
        <div
            css={{
                padding: '0em',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
            <div
                css={{
                    padding: '1em',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                <FunctionBounds
                    bounds={{
                        xMin: newData.xMin,
                        xMax: newData.xMax,
                        yMin: newData.yMin,
                        yMax: newData.yMax
                    }}
                    onChange={({ xMin, xMax, yMin, yMax }) =>
                        setNewData((d) => ({ ...d, xMin, xMax, yMin, yMax }))
                    }
                />
                <div
                    css={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '.5em',
                        borderLeft: '.1em solid'
                    }}>
                    <Color
                        colorStr={newData.color}
                        onChange={(colorStr) => setNewData((d) => ({ ...d, color: colorStr }))}
                    />
                    <span css={{ paddingRight: '.5em', paddingTop: '1em' }}>Mesh Size:</span>
                    <MeshSlider
                        min={50}
                        max={700}
                        meshSize={newData.meshSize}
                        onChange={(size) => setNewData((d) => ({ ...d, meshSize: size }))}
                    />
                </div>
            </div>
            <hr style={{ width: '100%' }} />
            <div
                css={{
                    padding: '0em',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                <Button margin={'2em'} onClickFunc={() => onChange(newData)}>
                    Make Changes
                </Button>
            </div>
        </div>
    );
}

function MeshSlider({ min, max, meshSize, onChange }) {
    const [size, setSize] = useState(meshSize);

    function handleChange(e) {
        onChange(parseInt(e.target.value));
        setSize(e.target.value);
    }

    return (
        <div
            css={{
                position: 'relative',
                padding: '1em',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
            <input
                type='range'
                min={min}
                max={max}
                value={size}
                step={50}
                onChange={handleChange}
            />
            <span
                css={{
                    position: 'absolute',
                    top: '4em',
                    left: '2em',
                    fontSize: '.75em'
                }}>
                Speed
            </span>
            <span
                css={{
                    position: 'absolute',
                    top: '4em',
                    right: '2em',
                    fontSize: '.75em'
                }}>
                Quality
            </span>
        </div>
    );
}

function Color({ colorStr, onChange }) {
    return (
        <div
            css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '.5em'
            }}>
            <span css={{ paddingRight: '.5em' }}>Color:</span>
            <Input size={10} initValue={colorStr} onC={(colorStr) => onChange(colorStr)} />
        </div>
    );
}

function MeshSize({ size, onChange }) {
    // if mesh size input is too large (e.g., > 400) give some kind of alert?

    return (
        <div
            css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '.5em'
            }}>
            <span css={{ paddingRight: '.5em' }}>Mesh Size:</span>
            <Input size={10} initValue={size} onC={(size) => onChange(parseInt(size))} />
        </div>
    );
}

export default React.memo(FunctionOptions);
