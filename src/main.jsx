import React from 'react';
import ReactDOM from 'react-dom';

import { Helmet } from 'react-helmet';

import './index.css';

let title = 'default title';

//import App from './pages/vibratingString/App.jsx';

//import App from './pages/df/App_canvas_test.jsx';

//import App from './pages/df/App.jsx';

//import App from './pages/df/App_simple_df.jsx';
//title = 'Direction field grapher';

//import App from './pages/df/App_sep.jsx';
//title = 'Separable equation direction field grapher';

//import App from './pages/df/App_logistic.jsx';
//title = 'Logistic equation';

//import App from './pages/df/App_linear.jsx';
//title = 'Linear equation';

//import App from './pages/df/App_sec_order.jsx';
//title = 'Second order linear equations';

import App from './pages/df/App_sec_order_cases.jsx';
title = 'Second order linear equations';

function main() {
    const element = document.createElement('div');
    ReactDOM.render(
        <React.Fragment>
            <Helmet>
                <meta name='viewport' content='width=device-width, user-scalable=no' />
                <title>{title}</title>
            </Helmet>

            <App />
        </React.Fragment>,
        element
    );

    return element;
}

document.body.appendChild(main());
