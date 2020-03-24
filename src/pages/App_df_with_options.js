import React, { useState, useRef, useEffect, useCallback } from 'react';

import { jsx } from '@emotion/core';

import * as THREE from 'three';

import {ControlBar} from '@jesseburke/basic-react-components';
import {Main} from '@jesseburke/basic-react-components';
import {FullScreenBaseComponent} from '@jesseburke/basic-react-components';
import {Button} from '@jesseburke/basic-react-components';
import {Modal} from '@jesseburke/basic-react-components';
import {ConditionalDisplay} from '@jesseburke/basic-react-components';

import {ThreeSceneComp, useThreeCBs} from '../components/ThreeScene.js';
import FunctionInput from '../components/FunctionInput.js';
import funcParser from '../utils/funcParser.js';
import FunctionOptions from '../components/FunctionOptions.js';
import CoordinateOptions from '../components/CoordinateOptions.js';
import CameraOptions from '../components/CameraOptions.js';
import ResetCameraButton from '../components/ResetCameraButton.js';
import RightDrawer from '../components/RightDrawer.js';
import ClickablePlaneComp from '../components/ClickablePlaneComp.js';

import useGridAndOrigin from '../graphics/useGridAndOrigin.js';
import use2DAxes from '../graphics/use2DAxes.js';
import use3DAxes from '../graphics/use3DAxes.js';
import FunctionGraph from '../graphics/FunctionGraph.js';
import ArrowGrid from '../graphics/ArrowGrid.js';
import DirectionFieldApproxGeom from '../graphics/DirectionFieldApprox.js';

import ArrowGeometry from '../graphics/ArrowGeometry.js';

//------------------------------------------------------------------------
//
// initial data
//


// should adjust these based on aspect ratio of users screen
const halfXSize = 20;
const halfYSize = 14;
const gridSize = 100;

const initColors = {
    funcGraph: '#E53935',
    axes: '#084C5E',
    label: '#83BBC9',
    controlBar: '#0A2C3C',
    optionsDrawer: '#C5CAE9'
};

const initFuncStr = "x*y*sin(x + y)/10";
// "x*y*sin(x^2 + y)/100"


const initArrowGridData = {
    gridSqSize: .25,
    color: initColors.funcGraph,
    arrowLength: .75,
    quadSize: halfXSize,
    func: funcParser(initFuncStr)
};


const labelStyle = {
    color: 'black',
    padding: '.1em',
    margin: '.5em',
    padding: '.4em',
    fontSize: '1.5em'
};

const initAxesData = {
    radius: .02,
    color: initColors.axes,
    length: halfXSize,
    tickDistance: 1,
    tickRadius: 2.5,      
    show: true,
    showLabels: true,
    labelStyle
};

const initGridData = {
    gridSqSize: 1,
    quadSize: halfXSize,
    show: true,
    originColor: 0x3F405C
};


const initCameraData = 
{position: [0, 0, 1],
 up: [0,0,1],
 //fov: 75,
 near: -1,
 far: 500,
 orthographic: { left: -halfXSize/2,
                 right: halfXSize/2,
                 top: halfYSize/2,
                 bottom: -halfYSize/2},
};

const initControlsData = {
    mouseButtons: {LEFT: THREE.MOUSE.PAN,
                  RIGHT: THREE.MOUSE.PAN}, 
	touches: { ONE: THREE.MOUSE.PAN,
		   TWO: THREE.TOUCH.PAN,
		   THREE: THREE.MOUSE.PAN },
    enableRotate: false,
    enabled: true,
    keyPanSpeed: 50 };

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

const solutionMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color( 0xc2374f ), 
						       opacity: 1.0,
                                                       side: THREE.FrontSide});



//------------------------------------------------------------------------

export default function App() {   

    const [arrowGridData, setArrowGridData] = useState( initArrowGridData );    

    const [axesData, setAxesData] = useState( initAxesData );

    const [gridData, setGridData] = useState( initGridData );

    const [cameraData, setCameraData] = useState( initCameraData );

    const [controlsData, setControlsData] = useState( initControlsData );

    const [colors, setColors] = useState( initColors );

    const [initialPt, setInitialPt] = useState(null);

    const threeSceneRef = useRef(null);

    // following will be passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    

    // determine whether various UI elements are drawn
    const [showOptsDrawer, setShowOptsDrawer] = useState(initOptionsOpen);
    const [showCameraOpts, setShowCameraOpts] = useState(false);
    const [showCoordOpts, setShowCoordOpts] = useState(false);

    const optionsButtonCallback =
          useCallback( () => setShowOptsDrawer(o => !o), [] );

    const cameraChangeCB = useCallback( (position) => {

        if( position )
            setCameraData( cd => ({...cd, position}));

        if(!threeCBs) return;                

        threeCBs.setCameraPosition( position );
        
    }, [threeCBs]);

    const funcInputCallback = useCallback(
        newFunc => setArrowGridData( ({func,...rest}) => ({func: newFunc, ...rest}) ),
        [] );

    const controlsCB = useCallback( (position) => {       

        if(!threeCBs) return;        
        
        setCameraData({position});
                
    }, [threeCBs] );


    // this is imperative because we are not updating cameraData
    const resetCameraCallback = useCallback( () => {

        if( !threeCBs ) return;

        setCameraData( initCameraData );
        threeCBs.setCameraPosition( initCameraData.position );
              
    }, [threeCBs] );

    //------------------------------------------------------------------------
    //
    // effects

    useGridAndOrigin({ gridData, threeCBs, originRadius: .1 });

     // arrowGrid effect
    useEffect( ()  => {

        if( !threeCBs ) return;

        const arrowGrid = ArrowGrid( arrowGridData );

        threeCBs.add( arrowGrid.getMesh() );
	
        return () => {
            threeCBs.remove( arrowGrid.getMesh() );
            arrowGrid.dispose();
        };
	
    }, [threeCBs, arrowGridData] );
    
    use2DAxes({ threeCBs, axesData });


    // solution effect
    useEffect( () => {

        if( !threeCBs || !initialPt ) return;

        const dfag = DirectionFieldApproxGeom({ func: arrowGridData.func, initialPt });

        const mesh = new THREE.Mesh( dfag, solutionMaterial );

        threeCBs.add( mesh );

        return () => {
            threeCBs.remove(mesh);
            dfag.dispose();
        };

    }, [threeCBs, initialPt, arrowGridData.func] );
                                                
    const clickCB = useCallback( (pt) => {

        console.log([pt.x, pt.y]);
        setInitialPt( [pt.x, pt.y] );      
        
    }, [] );
   
   
    return (       
        <FullScreenBaseComponent backgroundColor={colors.controlBar}
                                 fonts={fonts}>
          
          <ControlBar height={controlBarHeight} fontSize={initFontSize*percControlBar}>
            <span css={{
                paddingLeft: '30%',
                paddingRight: '10%' }}>             
	      <FunctionInput onChangeFunc={funcInputCallback}
                             initFuncStr={initFuncStr}
                             leftSideOfEquation="dy/dx ="/>  
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
              <ClickablePlaneComp threeCBs={threeCBs}                           
                                  clickCB={clickCB}/>
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
