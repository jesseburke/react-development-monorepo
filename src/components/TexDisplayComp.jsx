import React from 'react';

import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function TexDisplayComp({ str, userCss = {} }) {
    if (!str) return null;

    return <span style={userCss} dangerouslySetInnerHTML={{ __html: katex.renderToString(str) }} />;
}
