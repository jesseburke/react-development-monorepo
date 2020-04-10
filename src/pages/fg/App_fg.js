import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

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

const initCameraData = {
    position: [40, 40, 40],
    up: [0,0,1]
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

const initAxesData = {
    show: true,
    showLabels: true,
    labelStyle
};

const initGridData = {
    show: true
};



const funcStr = 'x*y*sin(x+y)/10';
const testFuncStr = 'sin(2*x)+1.5*sin(x)';        
    
const initState = {
    bounds: {xMin: -20, xMax: 20,
             yMin: -20, yMax: 20},
    funcStr,
    func: funcParser(funcStr)
};

const roundConst = 3;

function shrinkState({ bounds, funcStr }) {

    const {xMin, xMax, yMin, yMax} = bounds;
    
    const newObj = { b: [xMin, xMax, yMin, yMax],
                     fs: funcStr,
                   };
    return newObj;            
}

// f is a function applied to the string representing each array element

function strArrayToArray( strArray, f = Number ) {

    // e.g., '2,4,-32.13' -> [2, 4, -32.13]

    return strArray.split(',').map( x => f(x) );
}
    

function expandState({ b, fs }) {

    const bds = strArrayToArray( b, Number );

    return ({ bounds: {xMin: bds[0], xMax: bds[1], yMin: bds[2], yMax: bds[3]},
              funcStr: fs,
              func: funcParser(fs)
            });    
}

const gridBounds = initState.bounds;


const initFuncStr = "x*y*sin(x + y)/10";
// "x*y*sin(x^2 + y)/100"

const initFuncGraphData = {
    func: funcParser(initFuncStr),
    xMin: -20,
    xMax: 20,
    yMin: -20,
    yMax: 20,
    meshSize: 100,
    color: initColors.funcGraph
};

const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
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


// in em's
const optionsDrawerWidth = 20;

const initOptionsOpen = true;


//------------------------------------------------------------------------

export default function App() {   

    const [state, setState] = useState(initState);    

    const [axesData, setAxesData] = useState( initAxesData );

    const [gridData, setGridData] = useState( initGridData );

    const [cameraData, setCameraData] = useState( initCameraData );

    const [controlsData, setControlsData] = useState( initControlsData );

    const [colors, setColors] = useState( initColors );    

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    

    // determine whether various UI elements are drawn
    const [showOptsDrawer, setShowOptsDrawer] = useState(initOptionsOpen);
    const [showCameraOpts, setShowCameraOpts] = useState(false);
    const [showCoordOpts, setShowCoordOpts] = useState(false);
    const [showFuncOpts, setShowFuncOpts] = useState(false);

    const optionsButtonCallback =
          useCallback( () => setShowOptsDrawer(o => !o), [] );

    const cameraChangeCB = useCallback( (position) => {

        if( position )
            setCameraData( cd => ({...cd, position}));

        if(!threeCBs) return;                

        threeCBs.setCameraPosition( position );
        
    }, [threeCBs]);

    const funcInputCallback = useCallback(
        newFunc => setFuncGraphData( ({func, ...rest}) => ({func: newFunc, ...rest}) ),
        [] );

    const controlsCB = useCallback( (position) => {       

        setCameraData({position});
                
    }, [] );


    // this is imperative because we are not updating cameraData
    const resetCameraCallback = useCallback( () => {

        if( !threeCBs ) return;

        setCameraData( initCameraData );
        threeCBs.setCameraPosition( initCameraData.position );
              
    }, [threeCBs] );

    //------------------------------------------------------------------------
    //
    // init effects

    useGridAndOrigin({ threeCBs,
                       bounds: gridBounds,
                       show: initGridData.show,
                       originRadius: .1 });

    use3DAxes({ threeCBs,
                length: state.bounds.xMax,
                color: initColors.axes,
                show: initAxesData.show,
                showLabels: initAxesData.showLabels,
                labelStyle });

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
   
    return (       
        <FullScreenBaseComponent backgroundColor={colors.controlBar}
                                 fonts={fonts}>
          
          <ControlBar height={controlBarHeight} fontSize={initFontSize*percControlBar}>
            <span css={{
                paddingLeft: '30%',
                paddingRight: '10%' }}>             
	      <FunctionInput onChangeFunc={funcInputCallback}
                             initFuncStr={initFuncStr}
                             leftSideOfEquation="f(x,y) ="/>  
            </span>
            <Button fontSize={initFontSize*percButton}
                    onClickFunc={optionsButtonCallback} >
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
                            controlsData={controlsData}
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
                               onClickFunc={resetCameraCallback}
                               color={colors.optionsDrawer}
                               userCss={{ top: '85%',
                                          left: '5%'}}/>

            <Modal show={showCoordOpts}
                   key="axesModalWindow"
                   onClose={useCallback(
                       () => setShowCoordOpts(false), [] ) }                 
                   color={colors.optionsDrawer}>
              
              <CoordinateOptions axesData={axesData}
                                 gridData={gridData}
                                 onAxesChange={
                                     useCallback(newData => 
                                         setAxesData(ad => ({...ad, ...newData})) ,[])
                                 }
                                 onGridChange={
                                     useCallback(newData =>
                                                 setGridData(gd => ({...gd, ...newData})),
                                                             [])}/>
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
              
              <CameraOptions cameraData={cameraData}
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
