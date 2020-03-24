import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

import { jsx } from '@emotion/core';

import Input from './Input.js';

function functionBounds({ bounds: {xMin, xMax, yMin, yMax}, onChange }) {
    return (       
          <div css={{display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     padding: '.5em',
                     margin: '.5em'}}>
            <div css={{fontSize: '1em', width: '100%', display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: 'center'}}>
              Function Bounds
              <hr style={{width: '100%'}}/>
            </div>
            <div css={{
                display: 'grid',
                gridTemplateRows: 'repeat(5, auto)',
                gridTemplateColumns: 'repeat(5, auto)'
            }}>
              <div css={{
                  gridColumn: '3 / 4',
                  gridRow: '1 / 2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '.5em'
              }}>
                <span>yMax</span>
              </div>
              <div css={{
                  gridColumn: '3 / 4',
                  gridRow: '2 / 3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
              }}>
                <Input size={10}
                       initValue={yMax}
                       onC={ y =>
                             onChange({ xMin, xMax, yMin, yMax: parseInt(y) }) }/>
              </div>
              <div css={{
                  gridColumn: '1 / 2',
                  gridRow: '3 / 4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '.5em'
              }}>
                <span>xMin</span>
              </div>
              <div css={{
                  gridColumn: '2 / 3',
                  gridRow: '3 / 4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
              }}>
                <Input size={10}
                       initValue={xMin}
                       onC={ x =>
                             onChange({ xMin: parseInt(x), xMax, yMin, yMax }) }/>
              </div>
              <div css={{
                  gridColumn: '4 / 5',
                  gridRow: '3 / 4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
              }}>
                <Input size={10}
                       initValue={xMax}
                       onC={ x =>
                             onChange({ xMin, xMax: parseInt(x), yMin, yMax }) }/>
              </div>
              <div css={{
                  gridColumn: '5 / 6',
                  gridRow: '3 / 4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '.5em'
              }}>
                <span>xMax</span>
              </div>
              <div css={{
                  gridColumn: '3 / 4',
                  gridRow: '4 / 5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
              }}>
                <Input size={10}
                       initValue={yMin}
                       onC={ y =>
                             onChange({ xMin, xMax, yMin: parseInt(y), yMax}) }/>
              </div>
              <div css={{
                  gridColumn: '3 / 4',
                  gridRow: '5 / 6',               
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '.5em'
              }}>
                <span>yMin</span>
              </div>
            </div>
          </div>                
    );
}

const FunctionBounds = React.memo(functionBounds);

export default FunctionBounds;
