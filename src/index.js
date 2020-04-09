import React from 'react';
import ReactDOM from 'react-dom';

import './style.css';

//import App from './pages/df/App.js';  

//import App from './pages/df/App_sep.js';

//import App from './pages/df/App_logistic.js';

//import App from './pages/df/App_linear.js';

//import App from './pages/df/App_sec_order.js';

import App from './pages/df/App_resonance.js';

//import App from './pages/df/App_streamlines.js';

//import App from './pages/df/App_streamlines_new.js';

//import App from './pages/df/App_delaunay.js';

//import App from './pages/df/App_combo.js';

//import App from './pages/implicitFunc/App.js';  


function main() {
    const element = document.createElement('div');       
    ReactDOM.render(<App />, element);   
    
    return element;
}

document.body.appendChild(main());

