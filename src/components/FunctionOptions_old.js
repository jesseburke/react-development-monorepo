import React, { useState, useRef, useEffect } from 'react';

import { jsx } from '@emotion/core';

import Input from './Input.js';
import FunctionBounds from './FunctionBounds.js';
//import Color from './Color.js';

function FunctionOptions( {data : {func, xMin, xMax,
                                                  yMin, yMax, meshSize,
                                                  color}, onChange} ) {
    
    return ( 
        <div css={{
            padding: '1em',
            display: 'flex',
            justifyContent: 'space-between',                                  
        }}>
          <FunctionBounds bounds={{xMin, xMax, yMin, yMax}}
                          onChange={ o => onChange({...o, meshSize, color, func}) } />
          <div css={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '.5em',
              borderLeft: '.1em solid'
          }}>
            <Color colorStr={color}
                   onChange={ colorStr => onChange({func, xMin, xMax, yMin, yMax, meshSize,
                                                      color: colorStr}) }/>
            <MeshSize size={meshSize}
                      onChange={ size => onChange({func, xMin, xMax, yMin, yMax,
                                                         meshSize: size, color}) }/>
          </div>
        </div>
    );
}


function Color({ colorStr, onChange }) {
    return (
        <div  css={{display: 'flex',              
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '.5em'}}>
              <span css={{paddingRight: '.5em'}}>
                Color:
              </span>
              <Input size={10}
                     initValue={colorStr}
                     onC={ colorStr =>
                           onChange(colorStr) } />
        </div>
    );
}

function MeshSize({ size, onChange }) {

    // if mesh size input is too large (e.g., > 400) give some kind of alert
    
    return (
        <div  css={{display: 'flex',              
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '.5em'}}>
              <span css={{paddingRight: '.5em'}}>
                Mesh Size:
              </span>
              <Input size={10}
                     initValue={size}
                     onC={ size =>
                           onChange(parseInt(size)) } />
        </div>
    );
}

export default React.memo(FunctionOptions);


