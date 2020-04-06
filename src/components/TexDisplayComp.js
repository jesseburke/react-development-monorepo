import React from 'react';

import katex from 'katex';
import 'katex/dist/katex.min.css';

function TexDisplayComp({ str, userCss={} }) {

    if( !str )
        return null;
    
    return (
         <span style={userCss}
               dangerouslySetInnerHTML={{ __html: katex.renderToString(
                   str) }}/>
    );
    
}

export default React.memo(TexDisplayComp);
