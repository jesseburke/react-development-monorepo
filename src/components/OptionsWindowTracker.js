// see https://stackoverflow.com/questions/17481660/darken-background-image-on-hover
// for ideas on how to change hover behavior

import React from 'react';

import { jsx } from '@emotion/core';


export default function OptionsWindowTracker({ displayArr, onClickFunc,
                                               width }) {

    const a = displayArr.map( (o,index) => (<ListItem text={o.text}
                                                      toShow={!o.isOpen}
                                                      onClick={()=>onClickFunc(index)}
                                                      width={width}
                                                      key={(index+1).toString()}
                                            />) );
    
    return (
        <div css={{
            padding: '.5em 3em .5em 1em',            
            fontSize: '1.25em',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            userSelect: 'none'
        }}>          
          {a}
        </div>
    );
}


function ListItem({text,  onClick, toShow = true, width='20'}) {
    return (
        <div onClick={onClick}
             css={{display:'flex',
                   justifyContent: 'space-between',
                   width: width.toString()+'em',
                   cursor:'pointer'}}>
          <div>{text}</div>
          <div>{toShow ? '\u2795' : '\u274C'}</div>
        </div>
    );
}

