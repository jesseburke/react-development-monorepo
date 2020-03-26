import React, { useEffect, useCallback, useState } from 'react';

import Input from '../components/Input.js';

function InitialCondsComp({ initialConds=[[1,0],[1,1]], changeCB = () => null}) {

    const [firstPt, setFirstPt] = useState(initialConds[0]);
    const [secPt, setSecPt] = useState(initialConds[1]);

    useEffect( () => {

        changeCB([ firstPt, secPt ]);
        //console.log('effect inside initialCondsComp called');
        
    }, [firstPt, secPt] );

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
                     onC={useCallback( val => setFirstPt( pt => [Number(val), pt[1]] ) )}
                     size={4}/> <span>) = </span>
              <Input initValue={firstPt[1]}
                     onC={useCallback( val => setFirstPt( pt => [pt[0], Number(val)] ) )}
                     size={4}/>
            </div>
             <div css={{padding: '.25em 0'}}>
              <span>y'(</span>
               <Input initValue={secPt[0]}
                      onC={useCallback( val => setSecPt( pt => [Number(val), pt[1]] ) )}
                      size={4}/>
               <span>) = </span>
               <Input initValue={secPt[1]}
                      onC={useCallback( val => setSecPt( pt => [pt[0], Number(val)] ) )}
                      size={4}/>
            </div>
          </div>
        </div>
    );        
}

export default React.memo( InitialCondsComp );
