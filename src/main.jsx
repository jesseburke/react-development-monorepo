import React from 'react';
import ReactDOM from 'react-dom';

import { Helmet } from 'react-helmet';

import './styles.css';

//import App from './pages/df/App_df/App_df';
//const title = 'Direction Field Grapher';

import App from './pages/df/App_sep/App_sep';
const title = 'Separable Differential Equation Direction Field';

//import App from './pages/df/App_linear/App_linear';

//import App from './pages/vibratingString/App';
//import App from './pages/vibratingString/App_vs';
//const title = 'Vibrating string';

function main() {
    const element = document.createElement('div');

    // disables scrolling from touch actions
    element.style.touchAction = 'none';
    ReactDOM.render(
        <>
            <Helmet>
                <meta name='viewport' content='width=device-width, user-scalable=no' />
                <title>{title}</title>
            </Helmet>

            <App />
        </>,
        element
    );

    return element;
}

document.body.appendChild(main());
