import React, { useState, useRef, useEffect } from 'react';

import { jsx } from '@emotion/core';

import {Input} from '@jesseburke/basic-react-components';
import {ConditionalDisplay} from '@jesseburke/basic-react-components';

import FunctionBounds from './FunctionBounds.js';


function axesOptions( {axesData : {radius, color,
                                   show, length,
                                   tickDistance, tickRadius,
                                   tickColor, showTicks,                                  
                                   showLabels
                                  },                                      
                       onChange} )
{
    const axesData =  {radius, color,
                       tickDistance, tickRadius,
                       tickColor, showTicks,                      
                       showLabels, show };
    
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

          <JustAxes show={show}
                    radius={radius}
                    color={color}
                    showLabels={showLabels}
                    onChange={ ({
                        show, radius, color, showLabels }) =>
                               onChange({ ...axesData,
                                          show: show,
                                          radius: radius,
                                          color: color,
                                          showLabels: showLabels }) }
          />         

          <hr style={{width: '100%'}}/>
          
          <QuadSize size={length}
                    onChange={ size => onChange({ ...axesData,
                                                  gridQuadSize: size }) }/>
        </div>
    );
}

export default React.memo(axesOptions);

function JustAxes({
    show, radius, color, showLabels, onChange })
{

    const axesData = {show, radius, color, showLabels};
    
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
                             onChange({ ...axesData,
                                        show: event.target.checked,
                                        showLabels: event.target.checked})}/>
          </label>
          <ConditionalDisplay test={show}>         
            <Color colorStr={color}
                   onChange={ colorStr =>
                              onChange({ ...axesData,
                                         color: colorStr})}
            />
            <Radius size={radius}
                    onChange={ size =>
                               onChange({ ...axesData,
                                          radius: size })}/>
            <div css={{display: 'flex',              
                       alignItems: 'center',
                       justifyContent: 'center',
                       padding: '0em'}}>
              <label> Show axes labels: 
                <input type='checkbox' checked={showLabels}
                       onChange={event =>
                                 onChange({ ...axesData,
                                            showLabels: event.target.checked,
                                          })}/>
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

function Radius({ size, onChange }) {
    return (
        <div  css={{display: 'flex',              
                    alignItems: 'center',
                    justifyContent: 'center',
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


function QuadSize({ size, onChange }) {
    return (
        <div  css={{display: 'flex',              
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '.5em'}}>
          <div css={{paddingRight: '.5em'}}>
            <p>Graph paper (quadrant) size: </p>
          </div>
          <Input size={10}
                 initValue={size}
                 onC={ sizeStr =>
                       onChange(parseInt(sizeStr)) } />
        </div>
    );
}





