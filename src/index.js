import React from 'react';
import ReactDOM from 'react-dom';

import {Helmet} from 'react-helmet';

import './style.css';

//import App from './pages/df/App.js';  

//import App from './pages/df/App_sep.js';

//import App from './pages/df/App_logistic.js';

//import App from './pages/df/App_linear.js';

//import App from './pages/df/App_sec_order.js';

//import App from './pages/df/App_resonance.js';

//import App from './pages/df/App_streamlines.js';

//import App from './pages/df/App_streamlines_new.js';

//import App from './pages/df/App_delaunay.js';

//import App from './pages/df/App_combo.js';

//import App from './pages/implicitFunc/App.js';

//import App from './pages/fg/App_fg.js';

import App from './pages/vibratingString/App.js';


function main() {
    const element = document.createElement('div');       
    ReactDOM.render(<React.Fragment>
		      <Helmet>
                        <meta name="viewport" content="width=device-width, user-scalable=no" />
                      </Helmet>
                      <App />
                    </React.Fragment>, element);   
    
    return element;
}

document.body.appendChild(main());

