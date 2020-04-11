import React, { useState, useRef, useEffect, useCallback } from 'react';
import {Helmet} from 'react-helmet';

import { jsx } from '@emotion/core';

import queryString from 'query-string';

import * as THREE from 'three';

import {Button} from '@jesseburke/basic-react-components';
import {Modal} from '@jesseburke/basic-react-components';
import {ConditionalDisplay} from '@jesseburke/basic-react-components';

import ControlBar from '../../components/ControlBar.js';
import Main from '../../components/Main.js';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.js';
import {ThreeSceneComp, useThreeCBs} from '../../components/ThreeScene.js';
import FunctionInput from '../../components/FunctionInput.js';
import FunctionOptions from '../../components/FunctionOptions.js';
import CoordinateOptions from '../../components/CoordinateOptions.js';
import CameraOptions from '../../components/CameraOptions.js';
import ResetCameraButton from '../../components/ResetCameraButton.js';
import RightDrawer from '../../components/RightDrawer.js';
import SaveButton from '../../components/SaveButton.js';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use3DAxes from '../../graphics/use3DAxes.js';
import FunctionGraph3DGeom from '../../graphics/FunctionGraph3DGeom.js';

import funcParser from '../../utils/funcParser.js';
import {round} from '../../utils/BaseUtils.js';

//------------------------------------------------------------------------
//
// initial data
//

const initColors = {
    arrows: '#C2374F',
    solution: '#C2374F',
    firstPt: '#C2374F',
    secPt: '#C2374F',
    testFunc: '#E16962',//#DBBBB0',
    axes: '#0A2C3C',
    controlBar: '#0A2C3C',
    clearColor: '#f0f0f0',
    funcGraph: '#E53935'
};


const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE}, 
    touches: { ONE: THREE.MOUSE.PAN,
	       TWO: THREE.TOUCH.DOLLY,
	       THREE: THREE.MOUSE.ROTATE },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false};


const solutionMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color( initColors.solution ),
    side: THREE.FrontSide });

solutionMaterial.transparent = true;
solutionMaterial.opacity = .6;

const solutionCurveRadius = .1;

const pointMaterial = solutionMaterial.clone();
pointMaterial.transparent = false;
pointMaterial.opacity = .8;

const testFuncMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color( initColors.testFunc ),
    side: THREE.FrontSide });

testFuncMaterial.transparent = true;
testFuncMaterial.opacity = .6;

const testFuncRadius = .1;

const testFuncH = .01;

const dragDebounceTime = 5;


const initFuncStr = 'x*y*sin(x+y)/10';
const testFuncStr = 'sin(2*x)+1.5*sin(x)';        

const initCameraData =  {position: [40, 40, 40],
                         up: [0, 0, 1]};

const initState = {
    bounds: {xMin: -20, xMax: 20,
             yMin: -20, yMax: 20},
    funcStr: initFuncStr,
    func: funcParser(initFuncStr),
    gridQuadSize: 40,
    gridShow: true,
    axesData: {show: true,
               showLabels: true,
               length: 40,
               radius: .05},
    cameraData: Object.assign({},initCameraData)
};

const roundConst = 3;

function shrinkState({ bounds,
                       funcStr,
                       gridQuadSize,
                       gridShow,
                       axesData: {show, showLabels, length, radius},
                       cameraData: {position, up} }) {

    const {xMin, xMax, yMin, yMax} = bounds;
    
    const newObj = { b: [xMin, xMax, yMin, yMax],
                     fs: funcStr,
                     gqs: gridQuadSize,
                     gs: gridShow,
                     as: show,
                     sl: showLabels,
                     l: length,
                     r: radius,
                     cp: position.map( x => round(x,2)),
                     cu: up.map( x => round(x,2) )
                   };
    return newObj;            
}

// f is a function applied to the string representing each array element

function strArrayToArray( strArray, f = Number ) {

    // e.g., '2,4,-32.13' -> [2, 4, -32.13]

    return strArray.split(',').map( x => f(x) );
}


function expandState({ b, fs, gqs, gs, as, sl, l, r, cp, cu }) {

    const bds = strArrayToArray( b, Number );

    const cameraPos = strArrayToArray( cp, Number );
    const cameraUp = strArrayToArray( cu, Number );

    return ({ bounds: {xMin: bds[0], xMax: bds[1], yMin: bds[2], yMax: bds[3]},
              funcStr: fs,
              func: funcParser(fs),
              gridQuadSize: Number(gqs),
              gridShow: Number(gs),
              axesData: {show: as, showLabels: sl, length: Number(l), radius: Number(r)},
              cameraData: {position: cameraPos, up: cameraUp}
            });    
}


const initFuncGraphData = {
    func: funcParser(initFuncStr),
    xMin: -20,
    xMax: 20,
    yMin: -20,
    yMax: 20,
    meshSize: 100,
    color: initColors.funcGraph
};


const fonts = "'Helvetica', 'Hind', sans-serif";

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 10;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const percControlBar = 1.25;
const percButton = .85;
const percDrawer = .85;

const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};


// in em's
const optionsDrawerWidth = 20;

const initOptionsOpen = true;


//------------------------------------------------------------------------

export default function App() {   

    const [state, setState] = useState(Object.assign({}, initState));    

    const [colors, setColors] = useState( initColors );    

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    

    // determine whether various UI elements are drawn
    const [showOptsDrawer, setShowOptsDrawer] = useState(initOptionsOpen);
    const [showCameraOpts, setShowCameraOpts] = useState(false);
    const [showCoordOpts, setShowCoordOpts] = useState(false);
    const [showFuncOpts, setShowFuncOpts] = useState(false);

    
    //------------------------------------------------------------------------
    //
    // init effects

    useGridAndOrigin({ threeCBs,
                       gridQuadSize: state.gridQuadSize,
                       gridShow: state.gridShow,
                       originRadius: .1 });

    use3DAxes({ threeCBs,
                length: state.axesData.length,
                radius: state.axesData.radius,
                show: state.axesData.show,
                showLabels: state.axesData.showLabels,
                labelStyle,
                color: initColors.axes});

     //------------------------------------------------------------------------
    //
    // look at location.search

    // want to: read in the query string, parse it into an object, merge that object with
    // initState, then set all of the state with that merged object

    useEffect( () => {

        const qs = window.location.search;

        if( qs.length === 0 ) {

             setState( s => s );
             return;
            
         }

        const newState = expandState(queryString.parse(qs.slice(1),
                                                       {parseBooleans: true}));
        setState(newState);

        if( !threeCBs ) return;

        threeCBs.setCameraPosition( newState.cameraData.position );

        

        //console.log('state is ', state);
        //console.log('newState is ', newState);
        //console.log('expandState(newState) is ', expandState(newState) );
        

       
        //	window.history.replaceState(null, null, '?'+queryString.stringify(state));
        //window.history.replaceState(null, null, "?test");
        
    }, [threeCBs] );

    const saveButtonCB = useCallback( () => 
        window.history.replaceState(null, null,
                                    '?'+queryString.stringify(shrinkState(state),
                                                              {decode: false,
                                                               arrayFormat: 'comma'}))
                                      ,[state] );

    //------------------------------------------------------------------------
    //
    // funcGraph effect
    
    useEffect( ()  => {

        if( !threeCBs ) return;

        const geometry = FunctionGraph3DGeom({ func: state.func,
                                               bounds: state.bounds });
        const material = new THREE.MeshPhongMaterial({ color: initColors.funcGraph,
                                                       side: THREE.DoubleSide });
        material.shininess = 0;
        material.wireframe = false;

        const mesh = new THREE.Mesh( geometry, material );
        threeCBs.add(mesh);     

        return () => {
            threeCBs.remove( mesh );
            geometry.dispose();
            material.dispose();
        };
        
    }, [threeCBs, state.func, state.bounds] );


    //------------------------------------------------------------------------
    //
    // callbacks  

    const funcInputCB = useCallback( (newFunc, newFuncStr) => {
        setState( ({func, funcStr, ...rest}) => ({func: newFunc,
                                                  funcStr: newFuncStr,
                                                  ...rest}) );
    }, [] );      

    const controlsCB = useCallback( (position) => {       
        setState( ({cameraData, ...rest}) => ({cameraData:Object.assign(cameraData, {position}), ...rest}) );        
    }, [] );

    const cameraChangeCB = useCallback( (position) => {

        if( position ) {
            setState( ({cameraData, ...rest}) => ({cameraData:Object.assign(cameraData, {position}), ...rest}) );        
        }

        if(!threeCBs) return;                

        threeCBs.setCameraPosition( position );
        
    }, [threeCBs]);
  
    // this is imperative because we are not updating cameraData
    const resetCameraCB = useCallback( () => {

        if( !threeCBs ) return;

        setState( ({cameraData, ...rest}) => ({cameraData:Object.assign({},initCameraData), ...rest}) );    
        threeCBs.setCameraPosition( initCameraData.position );
        
    }, [threeCBs] );

    const gridCB =  useCallback( ({quadSize, show})  =>
                                 setState( ({gridQuadSize, gridShow, ...rest}) =>
                                           ({gridQuadSize: quadSize,
                                             gridShow: show,
                                             ...rest}) ),
                                 []);

    const axesCB = useCallback(  newAxesData => {
	        setState(({ axesData, ...rest }) => ({axesData: newAxesData, ...rest}));
    },[]);

    
    return (       
        <FullScreenBaseComponent backgroundColor={colors.controlBar}
                                 fonts={fonts}>
          <Helmet>
                <meta name="viewport" content="width=device-width, user-scalable=no" />
          </Helmet>
          
          <ControlBar height={controlBarHeight} fontSize={initFontSize*percControlBar}>
            <span css={{
                paddingLeft: '30%',
                paddingRight: '10%' }}>             
	      <FunctionInput onChangeFunc={funcInputCB}
                             initFuncStr={state.funcStr}
                             leftSideOfEquation="f(x,y) ="/>  
            </span>
            <Button fontSize={initFontSize*percButton}
                    onClickFunc={useCallback( () => setShowOptsDrawer(o => !o), [] )} >
              <div >
                <span css={{paddingRight: '1em'}}>Objects</span>
                <span>{showOptsDrawer ?'\u{2B06}' : '\u{2B07}'} </span>
              </div>            
            </Button>
          </ControlBar>
          
          <Main height={100-controlBarHeight}
                fontSize={initFontSize*percDrawer}>
            <ThreeSceneComp ref={threeSceneRef}
                            initCameraData={initCameraData}
                            controlsData={initControlsData}
                            controlsCB={controlsCB}
            />
            
            <RightDrawer toShow={showOptsDrawer}
                         width={optionsDrawerWidth}
                         color={colors.optionsDrawer}
                         fontSize={'1.5em'}>
              
              <ListItem width={optionsDrawerWidth - 9} onClick={
                  useCallback( () => setShowCoordOpts(s => !s),[])}>
                Coordinates
              </ListItem>
              
              <ListItem width={optionsDrawerWidth - 9} onClick={
                  useCallback( () => setShowCameraOpts(s => !s),[])}>
                Camera
              </ListItem>
              
              <ListItem width={optionsDrawerWidth - 9} onClick={
                  useCallback( () => setShowFuncOpts(s => !s),[])}>
                Function graph
              </ListItem>
              
            </RightDrawer>
            
            <ResetCameraButton key="resetCameraButton"
                               onClickFunc={resetCameraCB}
                               color={colors.optionsDrawer}
                               userCss={{ top: '73%',
                                          left: '5%'}}/>
             <SaveButton onClickFunc={saveButtonCB}/>

            <Modal show={showCoordOpts}
                   key="axesModalWindow"
                   onClose={useCallback(
                       () => setShowCoordOpts(false), [] ) }                 
                   color={colors.optionsDrawer}>
              
              <CoordinateOptions axesData={state.axesData}
                                 onAxesChange={axesCB}
                                 gridQuadSize={state.gridQuadSize}
                                 gridShow={state.gridShow}
                                 onGridChange={gridCB}/>
            </Modal>
            
            <Modal show={showFuncOpts}
                   key="funcModal"
                   onClose={useCallback(
                       () => setShowFuncOpts(false), [] ) }                  
                   color={colors.optionsDrawer}>
              
              <FunctionOptions initData={initFuncGraphData}
                               onChange={ useCallback(
                                   () => null, []) }
              />
              
            </Modal>
            
            <Modal show={showCameraOpts}
                   key="cameraModal"
                   onClose={useCallback(
                       () => setShowCameraOpts(false), [] ) }
                   leftPerc={80}
                   topPerc={70}
                   color={colors.optionsDrawer}>
              
              <CameraOptions cameraData={state.cameraData}
                             onChangeFunc={cameraChangeCB}
              />
            </Modal>
            
          </Main>
          
        </FullScreenBaseComponent>);                              
}

function ListItem({children, onClick, toShow = true, width='20'}) {
    return (
        <div onClick={onClick}
             css={{display:'flex',
                   justifyContent: 'space-between',
                   alignItems: 'flex-end',
                   width: width.toString()+'em',
                   cursor:'pointer'}}>
          <div>{children}</div>
          <div>{toShow ? '\u2699' : '\u274C'}</div>
        </div>
    );
}
// was above, where '\u2699' is now:
//'\u2795'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.log('error: ' + error);
        console.log('errorInfo ' + errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong with the graphics; try reloading].</h1>;
    }

    return this.props.children; 
}
}
