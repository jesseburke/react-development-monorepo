import React from 'react';
import ReactDOM from 'react-dom';

import { Helmet } from 'react-helmet';

import './index.css';
import App from './pages/vibratingString/App_test.jsx';

function main() {
    const element = document.createElement('div');
    ReactDOM.render(
        <React.Fragment>
            <Helmet>
                <meta name='viewport' content='width=device-width, user-scalable=no' />
            </Helmet>

            <App />
        </React.Fragment>,
        element
    );

    return element;
}

document.body.appendChild(main());

// ReactDOM.render(
//     <React.Fragment>
//         <App />
//     </React.Fragment>,
//     document.getElementById('root')
// );
