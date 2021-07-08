import React from 'react';
import ReactDOM from 'react-dom';

import { Helmet } from 'react-helmet';

import App from './App_svgParamGrapher';
const title = 'Parametric function grapher';

function main() {
    const element = document.createElement('div');

    // disables scrolling from touch actions
    element.style.touchAction = 'none';
    ReactDOM.render(
        <>
            <Helmet>
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=no'
                />
                <title>{title}</title>
            </Helmet>

            <App />
        </>,
        element
    );

    return element;
}

document.body.appendChild(main());
document.addEventListener(
    'wheel',
    function (e) {
        e.preventDefault();
        //console.log('wheel event fired on document');
    },
    { passive: false, capture: false }
);