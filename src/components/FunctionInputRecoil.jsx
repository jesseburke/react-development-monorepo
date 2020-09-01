import React, { useRef, useCallback } from 'react';

import Recoil from 'recoil';
const {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    useSetRecoilState,
    useRecoilCallback,
    atomFamily
} = Recoil;

import Input from '../components/Input.jsx';

import funcParser, { funcParserXT } from '../utils/funcParser.jsx';

export default React.memo(function FunctionInput({
    leftSideOfEquation,
    initFuncStr,
    funcAtom,
    totalWidth = '20em',
    inputSize = 25,
    userCss = {}
}) {
    const setFunc = useSetRecoilState(funcAtom);

    const handleChange = useCallback(
        (str) => {
            if (str.length === 0) {
                setFunc({ func: null });
                return;
            }
            setFunc({ func: funcParser(str) });
        },
        [setFunc]
    );

    const css1 = useRef(
        Object.assign(
            {
                width: totalWidth,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
                //border: '2px', borderStyle: 'dashed'
            },
            userCss
        ),
        []
    );

    const css2 = useRef(
        {
            padding: '.5em'
        },
        []
    );

    return (
        <span style={css1.current}>
            <span style={css2.current}>{leftSideOfEquation}</span>
            <Input size={inputSize} initValue={initFuncStr} onC={handleChange} />
        </span>
    );
});

function functionInputXT({
    leftSideOfEquation,
    onChangeFunc,
    initFuncStr,
    totalWidth = '20em',
    inputSize = 25,
    userCss = {}
}) {
    //const [funcStr, setFuncStr] = React.useState(initFuncStr);

    function handleChange(str) {
        //console.log('functionInput.handleChange called with string value = ', str);

        if (str.length === 0) {
            onChangeFunc(null);
            return;
        }

        onChangeFunc(funcParserXT(str), str);
    }

    const css1 = useRef(
        Object.assign(
            {
                width: totalWidth,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
                //border: '2px', borderStyle: 'dashed'
            },
            userCss
        ),
        []
    );

    const css2 = useRef(
        {
            padding: '.5em'
        },
        []
    );

    return (
        <span style={css1.current}>
            <span style={css2.current}>{leftSideOfEquation}</span>
            <Input size={inputSize} initValue={initFuncStr} onC={handleChange} />
        </span>
    );
}

export const FunctionInputXT = React.memo(functionInputXT);
