import React, { useState, useRef, useEffect } from 'react';

import { ConditionalDisplay } from '@jesseburke/basic-react-components';

import Input from './Input.jsx';

function CoordinateOptions({ axesData, gridQuadSize, gridShow, onAxesChange, onGridChange }) {
    return (
        <div
            css={{
                paddingTop: '2.5em',
                paddingLeft: '1.5em',
                paddingBottom: 0,
                paddingRight: '3em',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
            <Axes axesData={axesData} onChangeCB={(newData) => onAxesChange(newData)} />

            <hr style={{ width: '100%' }} />

            <Grid
                gridQuadSize={gridQuadSize}
                gridShow={gridShow}
                onChange={(newData) => onGridChange(newData)}
            />
        </div>
    );
}

export default React.memo(CoordinateOptions);

function Axes({ axesData, onChangeCB }) {
    const showCheckCB = (event) => {
        const { show, ...rest } = axesData;
        onChangeCB(Object.assign(rest, { show: event.target.checked }));
    };

    const lengthCB = (l) => {
        const { length, ...rest } = axesData;
        onChangeCB(Object.assign(rest, { length: l }));
    };

    const radiusCB = (r) => {
        const { radius, ...rest } = axesData;
        onChangeCB(Object.assign(rest, { radius: r }));
    };

    const labelCheckCB = (event) => {
        const { showLabels, ...rest } = axesData;
        onChangeCB(Object.assign(rest, { showLabels: event.target.checked }));
    };

    return (
        <div
            css={{
                paddingTop: '.5em',
                paddingLeft: '1.5em',
                paddingBottom: '.5em',
                paddingRight: '3em'
            }}>
            <label>
                {' '}
                Show axes:
                <input type='checkbox' checked={axesData.show} onChange={showCheckCB} />
            </label>
            <ConditionalDisplay test={axesData.show}>
                <Length length={axesData.length} onChange={lengthCB} />
                <Radius size={axesData.radius} onChange={radiusCB} />
                <div
                    css={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0em'
                    }}>
                    <label>
                        {' '}
                        Show axes labels:
                        <input
                            type='checkbox'
                            checked={axesData.showLabels}
                            onChange={labelCheckCB}
                        />
                    </label>
                </div>
            </ConditionalDisplay>
        </div>
    );
}

function Length({ length, onChange }) {
    return (
        <div
            css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 0,
                padding: '.0em'
            }}>
            <div css={{ paddingRight: '.5em' }}>
                <p>Length: </p>
            </div>
            <Input
                size={10}
                initValue={length}
                onC={(lengthStr) => onChange(parseFloat(lengthStr))}
            />
        </div>
    );
}

function Radius({ size, onChange }) {
    return (
        <div
            css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 0,
                padding: '0em'
            }}>
            <div css={{ paddingRight: '.5em' }}>
                <p>Radius: </p>
            </div>
            <Input size={10} initValue={size} onC={(sizeStr) => onChange(parseFloat(sizeStr))} />
        </div>
    );
}

function Grid({ gridQuadSize, gridShow, onChange }) {
    return (
        <div
            css={{
                paddingTop: '.5em',
                paddingLeft: '1.5em',
                paddingBottom: '.5em',
                paddingRight: '3em'
            }}>
            <label>
                {' '}
                Show xy-grid:
                <input
                    type='checkbox'
                    checked={gridShow}
                    onChange={(event) =>
                        onChange({ show: event.target.checked, quadSize: gridQuadSize })
                    }
                />
            </label>
            <ConditionalDisplay test={gridShow}>
                <div
                    css={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '.5em'
                    }}>
                    <div css={{ paddingRight: '.5em' }}>
                        <p>Quadrant size: </p>
                    </div>
                    <Input
                        size={10}
                        initValue={gridQuadSize}
                        onC={(sizeStr) => onChange({ show: gridShow, quadSize: parseInt(sizeStr) })}
                    />
                </div>
            </ConditionalDisplay>
        </div>
    );
}
