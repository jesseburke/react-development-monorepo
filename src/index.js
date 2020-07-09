import React from 'react';
import ReactDOM from 'react-dom';

import { Helmet } from 'react-helmet';

import './style.css';

//import App from './pages/df/App.js';

//import App from './pages/df/App_sep.js';

//import App from './pages/df/App_logistic.js';

//import App from './pages/df/App_linear.js';

//import App from './pages/df/App_sec_order.js';

//import App from './pages/df/App_resonance.js';

import App from './pages/df/App_streamlines.js';

//import App from './pages/df/App_delaunay.js';

// *** App_combo needs to be changed to use ArrowGridGeom instead of ArrowGrid
//import App from './pages/df/App_combo.js';

// *** not working super well
//import App from './pages/implicitFunc/App.js';

//import App from './pages/fg/App_fg.js';

//import App from './pages/vibratingString/App.js';

//------------------------------------------------------------------------

//import App from './pages/symmetry/App_fd.js';

//import App from './pages/symmetry/App_gd.js';

//import App from './pages/symmetry/App_reflection_fd.js';

//import App from './pages/symmetry/App_reflection_gd.js';

//import App from './pages/symmetry/App_reflection_fd_with_symm.js';

//import App from './pages/symmetry/App_reflection_gd_with_symm.js';

//import App from './pages/symmetry/App_rotation_fd.js';

//import App from './pages/symmetry/App_rotation_gd.js';

//import App from './pages/symmetry/App_rotation_fd_with_symm.js';

//import App from './pages/symmetry/App_rotation_gd_with_symm.js';

//import App from './pages/symmetry/App_reflection_solver_polygon.js';

//import App from './pages/symmetry/App_reflection_solver_disk.js';

//import App from './pages/symmetry/App_rotation_solver_polygon.js';

//import App from './pages/symmetry/App_rotation_solver_disk.js';

//import App from './pages/symmetry/App_translation_fd.js';

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
