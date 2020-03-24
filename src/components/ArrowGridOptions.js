import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import {Input} from '@jesseburke/basic-react-components';
import {Button} from '@jesseburke/basic-react-components';



export default function ArrowGridOptions({ initDensity, initLength, initApproxH,
                                           densityCB, lengthCB, approxHCB, userCss={}}) {

    const newCss =  Object.assign(
        {
            margin: 0,
            display: 'flex',
            height: '100%'          
        }, userCss);

    
    return (
        <div css={newCss}>
               
              <div  css={{
                  margin: 0,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' ,
                  justifyContent: 'center',
                  alignItems: 'center'}}>
                <div css={{textAlign: 'center'}}>
                  Arrow density:
                </div>
                <span css={{paddingTop: '.5em'}}>
                  <Input size={4}
                         initValue={initDensity}
                         onC={densityCB}/>
                </span>
              </div>
              
              <div  css={{
                  margin: 0,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' ,
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                  margin: '2em'}}>
                 <div css={{textAlign: 'center'}}>
                  Arrow length:
                </div>
                <span css={{paddingTop: '.5em'}}>
                  <Input size={4}
                         initValue={initLength}
                         onC={lengthCB}/>
                </span>
              </div>
              
              <div  css={{
                  margin: 0,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' ,
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center'}}>
                 <div css={{textAlign: 'center'}}>
                  Approx const:
                </div>
                <span css={{paddingTop: '.5em'}}>
                  <Input size={4}
                         initValue={initApproxH}
                         onC={approxHCB}/>
                </span>
              </div>
            </div>);
}
