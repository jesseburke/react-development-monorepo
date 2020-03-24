import React, { useState, useRef, useEffect } from 'react';

import { jsx } from '@emotion/core';

import {Input} from '@jesseburke/basic-react-components';
import {ConditionalDisplay} from '@jesseburke/basic-react-components';

import FunctionBounds from './FunctionBounds.js';


function CoordinateOptions( {axesData: {radius, color,
                                        show, length,
                                        tickDistance, tickRadius,
                                        tickColor, showTicks,                                  
                                        showLabels
                                       },
                             gridData,
                             onAxesChange, onGridChange} )
{

    return ( 
        <div css={{
            paddingTop: '2.5em',
            paddingLeft: '1.5em',
            paddingBottom: 0,
            paddingRight: '3em',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',                                  
        }}>                         

          <Axes show={show}
                radius={radius}
                color={color}
                length={length}
                showLabels={showLabels}
                onChangeCB={ (newData) =>
                             onAxesChange(newData) }/>         
          
          <hr style={{width: '100%'}}/>
          
          <Grid gridData={gridData}
                onChange={ (newData) =>
                           onGridChange(newData) }/>
        </div>
    );
}

export default React.memo(CoordinateOptions);

function Axes({
    show, radius, length, color, showLabels, onChangeCB })
{

    const axesData = {show, radius, length, color, showLabels};
    
    return (
        <div  css={{
            paddingTop: '.5em',
            paddingLeft: '1.5em',
            paddingBottom: '.5em',
            paddingRight: '3em'}}>
          <label> Show axes:
            <input type='checkbox'
                   checked={show}
                   onChange={event =>
                             onChangeCB({show: event.target.checked})}/>
          </label>
          <ConditionalDisplay test={show}>         
            <Color colorStr={color}
                   onChange={ colorStr =>
                              onChangeCB({color: colorStr})}
            />
            <Length length={length}
                    onChange={ length =>
                               onChangeCB({length: length })}/>
            <Radius size={radius}
                    onChange={ size =>
                               onChangeCB({radius: size })}/>
            <div css={{display: 'flex',              
                       alignItems: 'center',
                       justifyContent: 'center',
                       padding: '0em'}}>
              <label> Show axes labels: 
                <input type='checkbox' checked={showLabels}
                       onChange={event =>
                                 onChangeCB({ showLabels: event.target.checked})}/>
              </label>
            </div>
          </ConditionalDisplay>          
        </div>
    );
}

function Color({ colorStr, onChange }) {
    
    return (
        <div  css={{display: 'flex',              
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '.5em'}}>
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

function Length({ length, onChange }) {
    return (
        <div  css={{display: 'flex',              
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 0,
                    padding: '.0em'}}>
          <div css={{paddingRight: '.5em'}}>
            <p>Length: </p>
          </div>
          <Input size={10}
                 initValue={length}
                 onC={ lengthStr =>
                       onChange(parseFloat(lengthStr)) } />
        </div>
    );
}


function Radius({ size, onChange }) {
    return (
        <div  css={{display: 'flex',              
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 0,
                    padding: '0em'}}>
          <div css={{paddingRight: '.5em'}}>
            <p>Radius: </p>
          </div>
          <Input size={10}
                 initValue={size}
                 onC={ sizeStr =>
                       onChange(parseFloat(sizeStr)) } />
        </div>
    );
}


function Grid({ gridData, onChange }) {

       return (
        <div  css={{
            paddingTop: '.5em',
            paddingLeft: '1.5em',
            paddingBottom: '.5em',
            paddingRight: '3em'}}>
          <label> Show xy-grid:
            <input type='checkbox'
                   checked={gridData.show}
                   onChange={event =>
                             onChange({show: event.target.checked })}/>
          </label>
          <ConditionalDisplay test={gridData.show}>         
            <div  css={{display: 'flex',              
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '.5em'}}>
              <div css={{paddingRight: '.5em'}}>
                <p>Quadrant size: </p>
              </div>
              <Input size={10}
                     initValue={gridData.quadSize}
                     onC={ sizeStr =>
                           onChange({ quadSize: parseInt(sizeStr) }) } />
            </div>
          </ConditionalDisplay>          
        </div>               
    );
}





