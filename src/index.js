import React from 'react';
import ReactDOM from 'react-dom';

import './style.css';

//import App from './pages/App_df.js';

//import App from './pages/App_df_sep.js';

//import App from './pages/App_df_logistic.js';

//import App from './pages/App_df_logistic_tut.js';

//import App from './pages/App_df_linear.js';

//import App from './pages/App_df_sec_order.js';

import App from './pages/App_df_resonance.js';

//import App from './pages/App_df_streamlines.js';

//import App from './pages/App_delaunay.js';

//import App from './pages/App_df_combo.js';


function main() {
    const element = document.createElement('div');       
    ReactDOM.render(<App />, element);   
    
    return element;
}

document.body.appendChild(main());

