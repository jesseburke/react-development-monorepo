import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import Delaunator from 'delaunator';

import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';
import {Button} from '@jesseburke/basic-react-components';
import {Modal} from '@jesseburke/basic-react-components';
import {ConditionalDisplay} from '@jesseburke/basic-react-components';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import ControlBar from '../components/ControlBar.js';
import Main from '../components/Main.js';
import FunctionInput from '../components/FunctionInput.js';
import funcParser from '../utils/funcParser.js';
import FunctionOptions from '../components/FunctionOptions.js';
import CoordinateOptions from '../components/CoordinateOptions.js';
import CameraOptions from '../components/CameraOptions.js';
import ResetCameraButton from '../components/ResetCameraButton.js';
import RightDrawer from '../components/RightDrawer.js';
import ClickablePlaneComp from '../components/ClickablePlaneComp.js';
import Input from '../components/Input.js';

import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';
import use3DAxes from '../graphics/use3DAxes.js';
import FunctionGraph from '../graphics/FunctionGraph.js';
import ArrowGrid from '../graphics/ArrowGrid.js';
import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.js';
import DelaunayGeometry from '../graphics/DelaunayGeometry.js';

import {RK4_pts} from '../utils/RK4.js';

import TriangulationFactory, {circumcenter, circumradius} from '../factories/TriangulationFactory.js';

import {initColors, initArrowGridData, initAxesData,
        initGridData, initControlsData, secControlsData,
        bounds, initCameraData,
        initFuncStr, initXFuncStr, fonts,
        initYFuncStr} from './constants.js';


//------------------------------------------------------------------------
//
// initial data
//

const {xMin, xMax, yMin, yMax} = bounds;

const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};


// (relative) font sizes (first in em's)
const initFontSize = 1;

const solutionMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
						       opacity: 1.0,
                                                       side: THREE.FrontSide});

const pointMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
						       opacity: 1.0,
                                                       side: THREE.FrontSide});

const pointRadius = .05;


//------------------------------------------------------------------------

export default function App() {   
   
    const [controlsData, setControlsData] = useState( initControlsData );

    const [colors, setColors] = useState( initColors );

    const [pointArray, setPointArray] = useState([]);

    const [triangulation, setTriangulation] = useState(null);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    


    //------------------------------------------------------------------------
    //
    // effects

    useGridAndOrigin({ gridData: initGridData, threeCBs, originRadius: .1 });    
    use2DAxes({ threeCBs, axesData: initAxesData });

    useEffect( () => {

        setTriangulation( TriangulationFactory( pointArray ) );

    }, [pointArray] );
  

    // draws edges of triangles
    useEffect( () => {

        if( !threeCBs || !triangulation) return;

        const geom = DelaunayGeometry( triangulation );

        if( !geom ) return;

        const mesh = new THREE.Mesh( geom, solutionMaterial );

        threeCBs.add( mesh );    

        return ( () => {

            threeCBs.remove(mesh);
            geom.dispose();

        });

    }, [triangulation, threeCBs] );



    const clickCB = useCallback( (pt) => {  

        setPointArray( a =>  a.concat([[pt.x, pt.y]]) );      

        if( !threeCBs ) return;

        threeCBs.addLabel( { pos: [pt.x, pt.y, 0],
                             text: pointArray.length.toString(),
                             style: labelStyle } );

        threeCBs.drawLabels();
        
    }, [threeCBs, pointArray] );

    const d = Delaunator.from(pointArray);

    const triangleArray = d.triangles;

    let triangleDisplayStr = '';
    
    for( let i = 0; i < triangleArray.length; i+=3 ) {

        triangleDisplayStr += triangleArray[i].toString()
            + triangleArray[i+1].toString()
            + triangleArray[i+2].toString()
            + ',';
    }

    let halfedgeDisplayStr = '';

    d.halfedges.forEach( e => halfedgeDisplayStr += e.toString() + ', ' );
   
    return (       
        <FullScreenBaseComponent backgroundColor={colors.controlBar}
                                 fonts={fonts}>
                   <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={controlsData}
            />
            <ClickablePlaneComp threeCBs={threeCBs}                           
                                clickCB={clickCB}/>

          <div css={{
              position: 'absolute',
              top: '7%',
              left: '5%',
              border: '2px',
              borderStyle: 'solid',
              padding: '1em',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignContent: 'space-between',
              alignItems: 'center',
              fontSize: '1.25em',
              userSelect: 'none'
          }}>                        
                
                <div  css={{ paddingLeft: '1em',
                             paddingRight: '1em',
                             paddingTop: '.75em',
                             paddingBottom: '.75em',
                             display: 'flex',
                             justifyContent: 'space-around',
                             alignItems: 'baseline'}}>
                  
                  <span  css={{
                      margin: '.5em'}}> Triangles are :
                    {triangleDisplayStr}</span>                
                </div>

             <div  css={{ paddingLeft: '1em',
                             paddingRight: '1em',
                             paddingTop: '.75em',
                             paddingBottom: '.75em',
                             display: 'flex',
                             justifyContent: 'space-around',
                             alignItems: 'baseline'}}>
                  
                  <span  css={{
                      margin: '.5em'}}> Halfedge array is:
                    {halfedgeDisplayStr}</span>                
                </div>              
              </div>            
          
        </FullScreenBaseComponent>);                              
}
