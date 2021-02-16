import React from 'react';
import ReactDOM from 'react-dom';

import { Helmet } from 'react-helmet';

import './index.css';
import './styles.css';

import App from './App_df';
const title = 'Direction Field Grapher';

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
