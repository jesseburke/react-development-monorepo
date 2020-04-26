import React, {useRef} from 'react';

import { jsx } from '@emotion/core';

import Input from '../components/Input.js';

import funcParser, {funcParserXT} from '../utils/funcParser.js';


function FunctionAndBoundsInput({leftSideOfEquation,
                        onChangeFunc,
                        initFuncStr,
                        totalWidth='20em',
                        inputSize=25,
                        userCss={}}) {   

    //const [funcStr, setFuncStr] = React.useState(initFuncStr);

    function handleChange(str) {
        //console.log('functionInput.handleChange called with string value = ', str);

        if( str.length === 0 ) {

            onChangeFunc( null );
            return;
        }
        
        onChangeFunc(funcParser(str), str);
    }

    const css1 = useRef(Object.assign({
            width: totalWidth,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
            //border: '2px', borderStyle: 'dashed'
    }, userCss), []);

    const css2 = useRef({
              padding: '.5em'
    }, []);
    
    return (       
        <span style={css1.current}>
          <span  style={css2.current}>
            {leftSideOfEquation}
          </span>        
          <Input size={inputSize}
                 initValue={initFuncStr}
                 onC={handleChange}/>
        </span>
    );
}

export default React.memo(FunctionAndBoundsInput);

function functionInputAndBoundsXT({leftSideOfEquation,
                        onChangeFunc,
                        initFuncStr,
                        totalWidth='20em',
                        inputSize=25,
                        userCss={}}) {   

    //const [funcStr, setFuncStr] = React.useState(initFuncStr);

    function handleChange(str) {
        //console.log('functionInput.handleChange called with string value = ', str);

        if( str.length === 0 ) {

            onChangeFunc( null );
            return;
        }
        
        onChangeFunc(funcParserXT(str), str);
    }

    const css1 = useRef(Object.assign({
            width: totalWidth,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
            //border: '2px', borderStyle: 'dashed'
    }, userCss), []);

    const css2 = useRef({
              padding: '.5em'
    }, []);
    
    return (       
        <span style={css1.current}>
          <span  style={css2.current}>
            {leftSideOfEquation}
          </span>        
          <Input size={inputSize}
                 initValue={initFuncStr}
                 onC={handleChange}/>
        </span>
    );
}

export const FunctionAndBoundsInputXT = React.memo(functionInputAndBoundsXT);



          //  <span  css={{
          //     padding: '.5em',             
          // }}>
          //    {'\u{1F4AC}'}
          // </span>        
