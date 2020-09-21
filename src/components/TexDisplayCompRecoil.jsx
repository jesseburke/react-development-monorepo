import React from 'react';

import { atom, useAtom } from 'jotai';

import katex from 'katex';
import 'katex/dist/katex.min.css';

function TexDisplayComp({ strAtom, userCss = {}, className }) {
    const str = useAtom(strAtom)[0];

    if (!str) return null;

    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{ __html: katex.renderToString(str) }}
        />
    );
}

export default React.memo(TexDisplayComp);
