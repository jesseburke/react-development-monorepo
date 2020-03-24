import React, { useState, useRef, useEffect } from 'react';

import { jsx } from '@emotion/core';

import {Input} from '@jesseburke/basic-react-components';

export default function Color({ colorStr, onChange }) {
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
                           onChange(colorStr)} />
        </div>
    );
}
