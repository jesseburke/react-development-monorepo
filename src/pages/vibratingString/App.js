import React, { useState, useRef, useEffect, useCallback } from 'react';

import * as THREE from 'three';

import gsap from 'gsap';

import {Helmet} from 'react-helmet';
import queryString from 'query-string';

import './App.css';

import ControlBar from '../../components/ControlBar.js';
import Main from '../../components/Main.js';
import FullScreenBaseComponent from '../../components/FullScreenBaseComponent.js';
import {ThreeSceneComp, useThreeCBs} from '../../components/ThreeScene.js';
import {FunctionAndBoundsInputXT as FunctionAndBoundsInput} from '../../components/FunctionAndBoundsInput.js';
import FunctionOptions from '../../components/FunctionOptions.js';
import CoordinateOptions from '../../components/CoordinateOptions.js';
import CameraOptions from '../../components/CameraOptions.js';
import ResetCameraButton from '../../components/ResetCameraButton.js';
import RightDrawer from '../../components/RightDrawer.js';
import SaveButton from '../../components/SaveButton.js';
import Slider from '../../components/Slider.js';

import useGridAndOrigin from '../../graphics/useGridAndOrigin.js';
import use3DAxes from '../../graphics/use3DAxes.js';
import FunctionGraph3DGeom from '../../graphics/FunctionGraph3DGeom.js';
import CurvedPathCanvas from '../../graphics/CurvedPathCanvas.js';

import FunctionGraphPts2D from '../../math/FunctionGraphPts2D.js';

import {funcParserXT as funcParser} from '../../utils/funcParser.js';
import {round} from '../../utils/BaseUtils.js';

//------------------------------------------------------------------------
//
// initial data
//

const initColors = {
    arrows: '#C2374F',
    plane: '#82BFCD',
    axes:  '#181A2A',//0A2C3C',
    controlBar: '#181A2A',//0A2C3C',
    clearColor: '#f0f0f0',
    funcGraph: '#E53935'
};



const solutionCurveRadius = .1;

const dragDebounceTime = 5;


const initFuncStr = '2*e^(-(x-t)^2)';

// while it's assumed xMin and tMin are zero; it's handy to keep them around to not break things
const initBounds = {xMin: 0, xMax: 40,
                    tMin: 0, tMax: 40 };

const xLength = initBounds.xMax;
const tLength = initBounds.tMax;

const initCameraData =  {position: [(15.7/20)*xLength, -(13.1/20)*tLength, 9.79],//[40, 40, 40],                        
                         up: [0, 0, 1]};

const initState = {
    bounds: initBounds,
    funcStr: initFuncStr,
    func: funcParser(initFuncStr),     
    gridShow: true,
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

const initControlsData = {
    mouseButtons: { LEFT: THREE.MOUSE.ROTATE}, 
    touches: { ONE: THREE.MOUSE.PAN,
	       TWO: THREE.TOUCH.DOLLY,
	       THREE: THREE.MOUSE.ROTATE },
    enableRotate: true,
    enablePan: true,
    enabled: true,
    keyPanSpeed: 50,
    screenSpaceSpanning: false,
    target: new THREE.Vector3( (initBounds.xMax - initBounds.xMin)*(10.15/20),
                               (initBounds.tMax - initBounds.tMin)*(4.39/20),
                               0 )
};



const fonts = "'Helvetica', 'Hind', sans-serif";

// percentage of sbcreen appBar will take (at the top)
// (should make this a certain minimum number of pixels?)
const controlBarHeight = 15;

// (relative) font sizes (first in em's)
const initFontSize = 1;
const percControlBar = 1.25;
const percButton = .85;
const percDrawer = .85;

const labelStyle = {
    color: initColors.controlBar,
    padding: '.1em',
    margin: '0em',
    padding: '.15em',
    fontSize: '1.25em'
};


const axesData  = {show: true,
                   showLabels: true,
                   length: 50,
                   radius: .05};

const overhang = 5;
const zLength = 5;


// in em's
const optionsDrawerWidth = 20;

const initOptionsOpen = false;

// what percentage of the horizontal window the threeScene fills
const initThreeWidth = 50;

const initTimeH = .1;

const animConst = .1;

// time it takes (in secs) to animate 0 \leq t \leq 10
const animTime10T = .8;


//------------------------------------------------------------------------

export default function App() {   

    const [state, setState] = useState(Object.assign({}, initState));    

    const [colors, setColors] = useState( initColors );

    const [t0, setT0] = useState( 0 );

    const [planeMesh, setPlaneMesh] = useState( null );

    const [timeH, setTimeH] = useState( initTimeH );

    const [paused, setPaused] = useState( true );

    const [timeline, setTimeline] = useState( null );

    const [threeWidth, setThreeWidth]= useState( initThreeWidth );
    const threeSceneRef = useRef(null);
    const canvasRef = useRef(null);

    // following can be passed to components that need to draw
    const threeCBs = useThreeCBs( threeSceneRef );    
     
    
    //------------------------------------------------------------------------
    //
    // init effects

    useGridAndOrigin({ threeCBs,
                       gridQuadSize: axesData.length,
                       gridShow: state.gridShow,
                       originRadius: 0,
                       center: [ axesData.length - overhang,
                                 axesData.length - overhang ] });

    use3DAxes({ threeCBs,
                bounds: { xMin: -overhang,
                          xMax: axesData.length-5,
                          yMin: -overhang,
                          yMax: axesData.length-5,
                          zMin: -zLength,
                          zMax: zLength },
                radius: axesData.radius,
                show: axesData.show,
                showLabels: axesData.showLabels,
                labelStyle,
                yLabel: 't',
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
        
        //window.history.replaceState(null, null, '?'+queryString.stringify(state));
        //window.history.replaceState(null, null, "?test");
        
    }, [threeCBs] );

    const saveButtonCB = useCallback(
	() => window.history.replaceState(null, null,
					  '?'+queryString.stringify(shrinkState(state),
					   {decode: false,
					    arrayFormat: 'comma'}))
        ,[state] );

    //------------------------------------------------------------------------
    //
    // plane mesh

    useEffect( ()  => {

        if( !threeCBs ) return;

        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color( initColors.plane ),
            side: THREE.DoubleSide });

        material.transparent = true;
        material.opacity = .6;
        material.shininess = 0;

        const geometry = new THREE.PlaneGeometry( state.bounds.xMax + overhang,
                                                  2*zLength );
        geometry.rotateX(Math.PI/2);
        geometry.translate(state.bounds.xMax/2, t0, 0);
            
        const mesh = new THREE.Mesh( geometry, material );
        threeCBs.add( mesh );
        setPlaneMesh( mesh );

        return () => {
            threeCBs.remove( mesh );
            geometry.dispose();
            material.dispose();
        };
        
    }, [threeCBs, state.bounds.xMax] );

    const oldT0 = useRef( t0 );

    useEffect( () => {
        
        if( !planeMesh ) {
            oldT0.current = t0;
            return;
        }

        planeMesh.translateY( t0 - oldT0.current );
        oldT0.current = t0;

    }, [t0, planeMesh] );


    //------------------------------------------------------------------------
    //
    // animation
   
    // when pause changes, change the timeline;
    // creates a newtimeline each time paused changes;
    // this fixed a bug with pausing and restarting
    
    useEffect( () => {

        if( paused ) {
            if(timeline) timeline.pause();
            setTimeline( null );
            return;
        }
        
        const newTl = animFactory({ startTime: t0/state.bounds.tMax,
                                    duration: animTime10T*state.bounds.tMax/10,
                                    updateCB: (t) => setT0( t*state.bounds.tMax ) });        
        setTimeline( newTl );
        
    }, [paused] );

   

    //------------------------------------------------------------------------
    //
    // funcGraph effect
    
    useEffect( ()  => {

        if( !threeCBs ) return;

        const geometry = FunctionGraph3DGeom({ func: state.func,
                                               bounds: {...state.bounds,
                                                        yMin: state.bounds.tMin,
                                                        yMax: state.bounds.tMax},
                                               meshSize: 300 });
        
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
    // draw on canvas

    const ctx = useRef(null);

    useEffect( () => {

        if( !canvasRef.current ) return;

        ctx.current = canvasRef.current.getContext('2d');
        ctx.current.fillStyle = initColors.clearColor;//'#AAA';
        ctx.current.fillRect(0, 0,
                             ctx.current.canvas.width, ctx.current.canvas.height);
        ctx.current.lineJoin = 'round';       

    }, [canvasRef] );

    useEffect( () => {

        if( !canvasRef.current ) return;

        ctx.current.fillStyle = initColors.clearColor;//'#AAA';
        ctx.current.fillRect(0, 0,
                             ctx.current.canvas.width, ctx.current.canvas.height);

        const compArray = FunctionGraphPts2D({ func: (x) => state.func(x,t0),
                                               bounds: {xMin: 0,
                                                        xMax: state.bounds.xMax,
                                                        yMin: -zLength,
                                                        yMax: zLength} });
        
        
        CurvedPathCanvas({ compArray,
                           bounds: {...state.bounds,
                                    zMax: zLength,
                                    zMin: -zLength},
                           ctx: canvasRef.current.getContext('2d') });
        

    }, [state.bounds.xMax, t0, state.func, canvasRef] );


    //------------------------------------------------------------------------
    //
    // callbacks  

    const funcAndBoundsInputCB = useCallback( (newBounds, newFuncStr) => {
        setState( ({bounds, func, funcStr, ...rest}) =>
                  ({ funcStr: newFuncStr,
                     func: funcParser( newFuncStr ),
                     bounds: newBounds,
                     ...rest}) );
    }, [] );

    const sliderCB = useCallback( (newT0Str) => setT0( Number(newT0Str) ), []);

    const controlsCB = useCallback( (position) => {       
        setState( ({cameraData, ...rest}) =>
                  ({cameraData:Object.assign(cameraData, {position}), ...rest}) );        
    }, [] );

    const cameraChangeCB = useCallback( (position) => {

        if( position ) {
            setState( ({cameraData, ...rest}) =>
                      ({cameraData:Object.assign(cameraData, {position}), ...rest}) );        
        }

        if(!threeCBs) return;                

        threeCBs.setCameraPosition( position );
        
    }, [threeCBs]);
  
    // this is imperative because we are not updating cameraData
    const resetCameraCB = useCallback( () => {

        if( !threeCBs ) return;
        console.log(state.cameraData.position);
        console.log(threeCBs.getControlsTarget());	
        setState( ({cameraData, ...rest}) =>
                  ({cameraData:Object.assign({},initCameraData), ...rest}) );    
        threeCBs.setCameraPosition( initCameraData.position );
        
    }, [threeCBs] );

    const pauseCB = useCallback( () => setPaused( p => !p ), [] );
    
    return (       
        <FullScreenBaseComponent backgroundColor={colors.controlBar}
                                 fonts={fonts}>
          <Helmet>
            <title>Vibrating string</title>
                <meta name="viewport" content="width=device-width, user-scalable=no" />
          </Helmet>
          
          <ControlBar height={controlBarHeight} fontSize={initFontSize*percControlBar}>
                     
	      <FunctionAndBoundsInput onChangeFunc={funcAndBoundsInputCB}
                                      initFuncStr={state.funcStr}
                                      initBounds={state.bounds}
                                      leftSideOfEquation="s(x,t) ="/>
            <div className={'time-container'}>
                <Slider
                  value={t0}
                  CB={sliderCB}
                  label={'t0'}                  
                  max={state.bounds.tMax}
                  min={0}
                />
              <span onClick={pauseCB} className={'play-pause-button'}>
                {paused ? '\u{25B6}': '\u{23F8}'}
              </span>

            </div>
          </ControlBar>
          
          <Main height={100-controlBarHeight}
                fontSize={initFontSize*percDrawer}>
              <ThreeSceneComp ref={threeSceneRef}
                              initCameraData={initCameraData}
                              controlsData={initControlsData}
                              controlsCB={controlsCB}
                              width={threeWidth.toString()+'%'}
              />
              <canvas  css={{
                  position: 'absolute',
                  right: 0,
                  width: (100-threeWidth).toString()+'%',
                  height: '100%',
                  display: 'block'}}
                       width={1000}
                       height={1000}
                       ref={elt => canvasRef.current = elt} />
          </Main>
          
        </FullScreenBaseComponent>);                              
}

   // <ResetCameraButton key="resetCameraButton"
   //                             onClickFunc={resetCameraCB}
   //                             color={colors.optionsDrawer}
   //                             userCss={{ top: '73%',
   //                                        left: '5%'}}/>
   //           <SaveButton onClickFunc={saveButtonCB}/>
         
            
const animFactory = ({ startTime, duration, updateCB }) => {

    let time = {t:0};

    const tl = gsap.timeline();
    
    tl.to( time, {
        t: 1,
        ease: 'none',
        duration,
        paused: false,
        repeat: -1,
        onUpdate: () => updateCB(time.t),
    });

    tl.pause();        
    tl.seek(startTime*duration);
    tl.resume();        

    return tl;
};
