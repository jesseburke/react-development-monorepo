import React, { useEffect, useCallback, useState } from 'react';

import Input from '../components/Input.js';

function InitialCondsComp({ initialConds=[[1,0],[1,1]], changeCB = () => null}) {

    let firstPt = initialConds[0];
    let secPt = initialConds[1];

    

    return (
        <div css={{
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '.5em 1em',
            fontSize: '1.25em'
        }}>

          <div css={{padding: '0 1em'}}>Initial Conditions</div>

          <div css={{ margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      padding: '0em 1em'}}>
            <div css={{padding: '.25em 0'}}>
              <span>y(</span>
              <Input initValue={firstPt[0]}
                     onC={useCallback( val => {
                         firstPt = [Number(val), firstPt[1]];
                         changeCB([ firstPt, secPt ]);
                     })}
                     size={4}/> <span>) = </span>
              <Input initValue={firstPt[1]}
                     onC={useCallback( val => {
                         firstPt = [firstPt[0], Number(val)];
                         changeCB([ firstPt, secPt ]);
                     })}                    
                     size={4}/>
            </div>
             <div css={{padding: '.25em 0'}}>
              <span>y'(</span>
               <Input initValue={secPt[0]}
                      onC={useCallback( val => {
                          secPt = [Number(val), secPt[1]];
                          changeCB([ firstPt, secPt ]);
                      })}                    
                      size={4}/>
               <span>) = </span>
               <Input initValue={secPt[1]}
                      onC={useCallback( val => {
                          secPt = [secPt[0], Number(val)];
                          changeCB([ firstPt, secPt ]);
                      })}                    
                      size={4}/>
            </div>
          </div>
        </div>
    );        
}

export default React.memo( InitialCondsComp );
