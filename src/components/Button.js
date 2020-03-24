// see https://stackoverflow.com/questions/17481660/darken-background-image-on-hover
// for ideas on how to change hover behavior

import React, {useRef, useEffect, useState} from 'react';

import { jsx } from '@emotion/core';



export default React.memo(
    ({children,
      onClickFunc=(()=>null),
      fontSize='1em',
      margin=0,
      borderRadius='.35em',
      active=true}) => {

          if( !active ) {
            
              return (
                  <span
                   css={{
                       paddingLeft: '1em',
                       paddingRight: '1em',
                       paddingTop: '.25em',
                       paddingBottom: '.25em',
                       border: '2px',
                       borderStyle: 'solid',
                       borderRadius: borderRadius,
                       fontSize: fontSize.toString()+'em',
                       margin: margin,
                       width: '10em',
                       // next line stops cursor from changing to text selection on hover
                       cursor:'not-allowed'  ,
                       textAlign: 'center',
                       userSelect: 'none',
                       color: 'gray'
                   }}                                                       
                 >                         
                   {children}
                  </span>);
          };
           
          return (<span
                   css={{
                       paddingLeft: '1em',
                       paddingRight: '1em',
                       paddingTop: '.25em',
                       paddingBottom: '.25em',
                       border: '2px',
                       borderStyle: 'solid',
                       borderRadius: borderRadius,
                       fontSize: fontSize.toString()+'em',
                       margin: margin,
                       width: '10em',
                       // next line stops cursor from changing to text selection on hover
                       cursor:'pointer'  ,
                       textAlign: 'center',
                       userSelect: 'none'
                   }}                                    
                    onClick={onClickFunc}
                 >                         
                   {children}
                  </span>);
      }
);

// changes made since package

// 1) removed width prop

// 2) changed default font size from .75 to 1


