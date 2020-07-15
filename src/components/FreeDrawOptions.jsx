import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import {Input} from '@jesseburke/basic-react-components';
import {Button} from '@jesseburke/basic-react-components';



export default function FreeDrawOptions({ colorCB, widthCB, initColor, initWidth, children }) {

    return (
     <div css={{display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '.5em',
                userSelect: 'none',
                border: 'solid',
                borderWidth: '2px',
                borderRadius: '.25em'}}>

         <div css={{           
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             width: '100%',
             borderBottom: '2px solid',
             paddingBottom: '.5em'
         }}>
           Free Draw
         </div>
       <div css={{display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1em'}}>
         <span css={{paddingRight: '1em'}}>Color and width here</span>
         <div>
           {children}
         </div>
        </div>
     </div>
    );
 
}

function DisplayCameraPositionComp({ position, onClickFunc }) {

       return (
        <div css={{display: 'flex',
                   flexDirection: 'column',
                   alignItems: 'center',
                   justifyContent: 'center',
                   padding: '.5em',
                   userSelect: 'none'}}>
          
          <div css={{
              paddingTop: '2.5em',
              paddingLeft: '1.5em',
              paddingBottom: '1em',
              paddingRight: '3em',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center'
          }}>                         
            <div>Camera position: </div>
            <div> x = {roundTwoPlaces(position[0].toString())} </div>
            <div> y = {roundTwoPlaces(position[1].toString())} </div>
            <div> z = {roundTwoPlaces(position[2].toString())} </div>
          </div>
          <hr style={{width: '100%'}}/>
          <div css={{
              paddingTop: '1em',
              paddingLeft: '1.5em',
              paddingBottom: '1em',
              paddingRight: '3em',            
          }}>
            <Button onClickFunc={ onClickFunc }
                    fontSize='.8'>
              Change position
            </Button>
          </div>
        </div>
       );
}

    

function ChangeCameraComp({ cbFunc, startingPosition })
{
    const [position, setPosition] = useState(startingPosition);

    const xinput = useRef(null);
    const yinput = useRef(null);
    const zinput = useRef(null);
    
    return (
        <div css={{display: 'flex',
                   flexDirection: 'column',
                   alignItems: 'center',
                   justifyContent: 'center',
                   padding: '2em'}}>
          
          <div  css={{
              padding: '1em' }}>
            New camera position:
          </div>
          
          <form>
            <div> x =
              <input type="text" ref={xinput} size={5} defaultValue={position[0]}>
              </input>
            </div>
             <div> y =
               <input type="text" ref={yinput} size={5} defaultValue={position[1]}>
              </input>
             </div>
             <div> z =
               <input type="text" ref={zinput} size={5} defaultValue={position[2]}>
              </input>
            </div>
            <div css={{
                paddingTop: '1.5em',
                paddingLeft: '1em',
                paddingBottom: '1em',
                paddingRight: '2em',            
            }}>
              <Button onClickFunc={ () => cbFunc([eval(Number(xinput.current.value)),
                                                  eval(Number(yinput.current.value)),
                                                  eval(Number(zinput.current.value))]) }
                      fontSize='1'>
                Set
              </Button>
            </div>
          </form>
          
        </div>               
    );
}


function roundTwoPlaces(num) {
    return (Math.round(100*num+.00001)/100);
}


