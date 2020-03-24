import React from 'react';

import { jsx } from '@emotion/core';

// height is assumed to be number, giving percentage of screen appBar will take (at the top)

function main( {children, height, fontSize=.85} ) {
    const t = (100-height).toString()+'%';
    
    return (
        <main
          css={{
              // external layout
              position: 'absolute',
              top: t,
              left: 0,
              right: 0,
              bottom: 0,
              // internal layout
              padding: 0,
              backgroundColor: '#ffffff',
              //borderStyle: 'dashed'
              fontSize: fontSize.toString()+'em'
          }}>
          {children}
        </main>
    );    
}

const Main = React.memo(main);

export default Main;
