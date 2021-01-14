import React from 'react';
import ReactDOM from 'react-dom';

import { Helmet } from 'react-helmet';

import './index.css';
import './tailwind.css';

import App from './pages/df/App_df/App_df.jsx';

let title = 'default title';

//import App from './pages/vibratingString/App.jsx';

//import App from './pages/df/App_canvas_test.jsx';

//import App from './pages/df/App_test_jotai.jsx';

//import App from './pages/df/App_test_valtio.jsx';

//import App from './pages/df/App_sep.jsx';
//title = 'Separable equation direction field grapher';

//import App from './pages/df/App_logistic.jsx';
//title = 'Logistic equation';

//import App from './pages/df/App_linear.jsx';
//title = 'Linear equation';

//import App from './pages/df/App_sec_order.jsx';
//title = 'Second order linear equation';

//import App from './pages/df/App_sec_order_cases.jsx';
//title = 'Second order linear equations';

//import App from './pages/fg/App_fg.jsx';

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
