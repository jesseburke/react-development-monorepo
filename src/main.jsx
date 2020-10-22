import React from 'react';
import ReactDOM from 'react-dom';

import { Helmet } from 'react-helmet';

import { Provider } from 'jotai';

import './index.css';

let title = 'default title';

//import App from './pages/vibratingString/App.jsx';

//import App from './pages/df/App_canvas_test.jsx';

//import App from './pages/df/App_df.jsx';

import App from './pages/df/App_df_test.jsx';

//import App from './pages/df/App_simple_df.jsx';
//title = 'Direction field grapher';

//import App from './pages/df/App_sep.jsx';
//title = 'Separable equation direction field grapher';

//import App from './pages/df/App_logistic.jsx';
//title = 'Logistic equation';

//import App from './pages/df/App_linear.jsx';
//title = 'Linear equation';

//import App from './pages/df/App_sec_order.jsx';
title = 'Second order linear equation';

//import App from './pages/df/App_sec_order_cases.jsx';
//title = 'Second order linear equations';

//import App from './pages/fg/App_fg_new.jsx';

function main() {
    const element = document.createElement('div');
    ReactDOM.render(
        <Provider>
            <Helmet>
                <meta name='viewport' content='width=device-width, user-scalable=no' />
                <title>{title}</title>
            </Helmet>

            <App />
        </Provider>,
        element
    );

    return element;
}

document.body.appendChild(main());
