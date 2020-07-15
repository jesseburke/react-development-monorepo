import React from 'react';
import ReactDOM from 'react-dom';

import { Helmet } from 'react-helmet';

import './style.css';

//import App from './pages/df/App.jsx';

//import App from './pages/df/App_sep.jsx';

//import App from './pages/df/App_logistic.jsx';

//import App from './pages/df/App_linear.jsx';

//import App from './pages/df/App_sec_order.jsx';

//import App from './pages/df/App_resonance.jsx';

//import App from './pages/df/App_streamlines.jsx';

//import App from './pages/df/App_delaunay.jsx';

// *** App_combo needs to be changed to use ArrowGridGeom instead of ArrowGrid
//import App from './pages/df/App_combo.jsx';

// *** not working super well
//import App from './pages/implicitFunc/App.jsx';

//import App from './pages/fg/App_fg.jsx';

import App from './pages/vibratingString/App.jsx';

//------------------------------------------------------------------------

//import App from './pages/symmetry/App_fd.jsx';

//import App from './pages/symmetry/App_gd.jsx';

//import App from './pages/symmetry/App_reflection_fd.jsx';

//import App from './pages/symmetry/App_reflection_gd.jsx';

//import App from './pages/symmetry/App_reflection_fd_with_symm.jsx';

//import App from './pages/symmetry/App_reflection_gd_with_symm.jsx';

//import App from './pages/symmetry/App_rotation_fd.jsx';

//import App from './pages/symmetry/App_rotation_gd.jsx';

//import App from './pages/symmetry/App_rotation_fd_with_symm.jsx';

//import App from './pages/symmetry/App_rotation_gd_with_symm.jsx';

//import App from './pages/symmetry/App_reflection_solver_polygon.jsx';

//import App from './pages/symmetry/App_reflection_solver_disk.jsx';

//import App from './pages/symmetry/App_rotation_solver_polygon.jsx';

//import App from './pages/symmetry/App_rotation_solver_disk.jsx';

//import App from './pages/symmetry/App_translation_fd.jsx';

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
